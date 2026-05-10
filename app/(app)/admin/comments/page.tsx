'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Trash2, MessageSquare } from 'lucide-react'

interface CommentItem {
  id: string
  postSlug: string
  parentId: string | null
  nickname: string
  content: string
  createdAt: string
  updatedAt: string
}

interface PostGroup {
  slug: string
  count: number
}

export default function AdminCommentsPage() {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    document.title = '댓글 관리 | Admin'
    if (user) fetchComments()
  }, [user])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const token = await user?.getIdToken()
      const res = await fetch('/api/comments?all=true', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('이 댓글을 삭제하시겠습니까? 답글도 함께 삭제됩니다.')) return

    setDeletingId(commentId)
    try {
      const token = await user?.getIdToken()
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId }),
      })

      if (res.ok) {
        // Remove the deleted comment and its replies from state
        setComments((prev) =>
          prev.filter((c) => c.id !== commentId && c.parentId !== commentId)
        )
      } else {
        const data = await res.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  // Calculate comment count per post
  const postGroups: PostGroup[] = Object.entries(
    comments.reduce<Record<string, number>>((acc, comment) => {
      acc[comment.postSlug] = (acc[comment.postSlug] || 0) + 1
      return acc
    }, {})
  )
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count)

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const contentPreview = (content: string) => {
    return content.length > 100 ? content.slice(0, 100) + '…' : content
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
      <div className="space-y-6 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">댓글 관리</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              전체 댓글 {comments.length}개 · {postGroups.length}개 포스트
            </p>
          </div>
          <button
            onClick={fetchComments}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            새로고침
          </button>
        </div>

        {/* Post comment counts */}
        {postGroups.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {postGroups.map((group) => (
              <span
                key={group.slug}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
              >
                <MessageSquare className="h-3 w-3" />
                {group.slug}
                <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-bold dark:bg-blue-800">
                  {group.count}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Comments table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  포스트
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  닉네임
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  내용
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  작성일
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">
                  삭제
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                      불러오는 중...
                    </div>
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    아직 댓글이 없습니다.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr
                    key={comment.id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                        {comment.postSlug}
                      </span>
                      {comment.parentId && (
                        <span className="ml-2 inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          답글
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {comment.nickname}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {contentPreview(comment.content)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                        title="댓글 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === comment.id ? '삭제 중...' : '삭제'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
