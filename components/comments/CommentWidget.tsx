'use client'

import { useEffect, useRef, useState } from 'react'
import CommentForm from './CommentForm'
import CommentList from './CommentList'

export interface CommentResponse {
  id: string
  postSlug: string
  parentId: string | null
  nickname: string
  content: string
  createdAt: string
  updatedAt: string
}

interface CommentWidgetProps {
  slug: string
}

export default function CommentWidget({ slug }: CommentWidgetProps) {
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver: 댓글 영역이 뷰포트에 들어오면 fetch 시작
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // 200px 전에 미리 로딩 시작
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 뷰포트에 들어왔을 때만 fetch
  useEffect(() => {
    if (!isVisible || hasFetched) return

    setIsLoading(true)
    setHasFetched(true)

    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data.comments ?? [])
      })
      .catch(() => {
        setComments([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [isVisible, hasFetched, slug])

  const handleCommentSuccess = (comment: CommentResponse) => {
    setComments((prev) => [...prev, comment])
  }

  const handleDelete = (commentId: string) => {
    setComments((prev) =>
      prev.filter((c) => c.id !== commentId && c.parentId !== commentId)
    )
  }

  return (
    <div ref={containerRef} className="mt-10 border-t border-gray-200 pt-10 dark:border-gray-700">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">댓글</h2>

      <CommentForm slug={slug} onSuccess={handleCommentSuccess} />

      {!isVisible || isLoading ? (
        <div className="space-y-4 py-8">
          <div className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          <div className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-gray-500 dark:text-gray-400">
          아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요
        </p>
      ) : (
        <CommentList comments={comments} slug={slug} onDelete={handleDelete} onReplySuccess={handleCommentSuccess} />
      )}
    </div>
  )
}
