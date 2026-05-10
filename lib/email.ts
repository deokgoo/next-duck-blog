import 'server-only'

import { Resend } from 'resend'

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@resend.dev'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-blog.vercel.app'

function getResendClient(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY is not configured. Email notifications are disabled.')
    return null
  }
  return new Resend(RESEND_API_KEY)
}

/**
 * Truncates content to a maximum of 100 characters for email excerpts.
 */
function excerpt(content: string, maxLength = 100): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength) + '...'
}

/**
 * Generates the URL for a blog post given its slug.
 */
function getPostUrl(postSlug: string): string {
  return `${SITE_URL}/blog/${postSlug}`
}

interface AdminNotificationParams {
  postSlug: string
  postTitle: string
  nickname: string
  content: string
}

/**
 * Sends an email notification to the admin when a new comment is posted.
 * Errors are logged but never thrown — email delivery is non-blocking.
 */
export async function sendAdminNotification({
  postSlug,
  postTitle,
  nickname,
  content,
}: AdminNotificationParams): Promise<void> {
  const resend = getResendClient()
  if (!resend) return

  if (!ADMIN_EMAIL) {
    console.warn('[email] ADMIN_EMAIL is not configured. Skipping admin notification.')
    return
  }

  const postUrl = getPostUrl(postSlug)
  const contentExcerpt = excerpt(content)

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `[블로그] 새 댓글: ${postTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">새 댓글이 달렸습니다</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #6b7280; width: 80px;">게시글</td>
              <td style="padding: 8px 12px;">${postTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #6b7280;">작성자</td>
              <td style="padding: 8px 12px;">${nickname}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #6b7280;">내용</td>
              <td style="padding: 8px 12px;">${contentExcerpt}</td>
            </tr>
          </table>
          <a href="${postUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; margin-top: 12px;">게시글 보기</a>
        </div>
      `,
    })
  } catch (error) {
    console.error('[email] Failed to send admin notification:', error)
  }
}

interface ReplyNotificationParams {
  toEmail: string
  postSlug: string
  postTitle: string
  parentNickname: string
  replyNickname: string
  replyContent: string
  originalContent: string
}

/**
 * Sends an email notification to the parent comment author when a reply is posted.
 * Errors are logged but never thrown — email delivery is non-blocking.
 */
export async function sendReplyNotification({
  toEmail,
  postSlug,
  postTitle,
  parentNickname,
  replyNickname,
  replyContent,
  originalContent,
}: ReplyNotificationParams): Promise<void> {
  const resend = getResendClient()
  if (!resend) return

  if (!toEmail) {
    return
  }

  const postUrl = getPostUrl(postSlug)
  const originalExcerpt = excerpt(originalContent)
  const replyExcerpt = excerpt(replyContent)

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject: '[블로그] 댓글에 답글이 달렸습니다',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">댓글에 답글이 달렸습니다</h2>
          <p style="color: #6b7280; margin-bottom: 16px;">
            <strong>${parentNickname}</strong>님, 게시글 "<strong>${postTitle}</strong>"에 남기신 댓글에 답글이 달렸습니다.
          </p>
          <div style="background-color: #f9fafb; border-left: 4px solid #d1d5db; padding: 12px 16px; margin: 16px 0;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">내 댓글:</p>
            <p style="color: #374151; margin: 0;">${originalExcerpt}</p>
          </div>
          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 16px 0;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;"><strong>${replyNickname}</strong>님의 답글:</p>
            <p style="color: #374151; margin: 0;">${replyExcerpt}</p>
          </div>
          <a href="${postUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; margin-top: 12px;">게시글 보기</a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            이 이메일은 댓글 작성 시 입력하신 이메일 주소로 발송되었습니다.
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('[email] Failed to send reply notification:', error)
  }
}
