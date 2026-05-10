import { NextRequest, NextResponse } from 'next/server'
import {
  validateComment,
  validateEmail,
  checkCommentRateLimit,
  resolveParentId,
  createComment,
  getCommentsBySlug,
  getAllComments,
  getCommentById,
  deleteComment,
  verifyPassword,
  toCommentResponse,
} from '@/lib/comments'
import { sendAdminNotification, sendReplyNotification } from '@/lib/email'
import { verifyAuth } from '@/lib/auth/serverAuth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, nickname, password, content, email, parentId, honeypot, postTitle } = body

    // 1. 허니팟 필드 확인 — 봇 감지 시 200 반환 (저장하지 않음)
    if (honeypot) {
      return NextResponse.json({ success: true, comment: null })
    }

    // 2. 입력 유효성 검증
    const validation = validateComment({ nickname, password, content })
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // 이메일 형식 검증 (선택 필드)
    if (email && !validateEmail(email)) {
      return NextResponse.json({ error: '올바른 이메일 형식을 입력해주세요' }, { status: 400 })
    }

    // 3. 클라이언트 IP 추출
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 4. Rate limit 확인
    const { allowed } = await checkCommentRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요' },
        { status: 429 }
      )
    }

    // 5. parentId 해석 — 답글의 답글인 경우 루트 조상으로 해석
    let resolvedParentId: string | null = null
    if (parentId) {
      resolvedParentId = await resolveParentId(parentId)
    }

    // 6. 댓글 생성 (비밀번호 해싱, 닉네임/내용 새니타이즈, Firestore 저장)
    const comment = await createComment({
      postSlug: slug,
      nickname,
      password,
      content,
      email: email || null,
      parentId: resolvedParentId,
    })

    // 7. 이메일 알림 (비차단, fire-and-forget)
    const title = postTitle || slug
    sendAdminNotification({ postSlug: slug, postTitle: title, nickname, content }).catch(() => {})

    if (resolvedParentId) {
      const parentComment = await getCommentById(resolvedParentId)
      if (parentComment?.email) {
        sendReplyNotification({
          toEmail: parentComment.email,
          postSlug: slug,
          postTitle: title,
          parentNickname: parentComment.nickname,
          replyNickname: nickname,
          replyContent: content,
          originalContent: parentComment.content,
        }).catch(() => {})
      }
    }

    // 8. CommentResponse 반환 (passwordHash/email 제외)
    return NextResponse.json({ success: true, comment: toCommentResponse(comment) })
  } catch (error) {
    console.error('[Comments API] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get('all')

    // Admin: fetch all comments (requires auth)
    if (all === 'true') {
      const decodedToken = await verifyAuth(request)
      if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const comments = await getAllComments()
      return NextResponse.json({ comments })
    }

    const slug = request.nextUrl.searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const comments = await getCommentsBySlug(slug)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('[Comments API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId, password } = body

    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 })
    }

    const authHeader = request.headers.get('Authorization')

    // Admin deletion path
    if (authHeader) {
      const decodedToken = await verifyAuth(request)
      if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Admin verified — delete comment + cascade replies
      const comment = await getCommentById(commentId)
      if (!comment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
      }

      await deleteComment(commentId)
      return NextResponse.json({ success: true })
    }

    // Visitor deletion path — password required
    if (!password) {
      return NextResponse.json({ error: 'password is required' }, { status: 400 })
    }

    const comment = await getCommentById(commentId)
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const isPasswordValid = await verifyPassword(password, comment.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다' }, { status: 403 })
    }

    await deleteComment(commentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Comments API] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
