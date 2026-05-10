'use client'

import { useState } from 'react'
import { CommentResponse } from './CommentWidget'
import CommentForm from './CommentForm'

interface CommentItemProps {
  comment: CommentResponse
  replies: CommentResponse[]
  slug: string
  onReplySuccess: (comment: CommentResponse) => void
  onDelete: (id: string) => void
  isReply?: boolean
}

function getRelativeTime(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diffMs = now - date

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (minutes < 1) return '방금 전'
  if (hours < 1) return `${minutes}분 전`
  if (days < 1) return `${hours}시간 전`
  if (days < 30) return `${days}일 전`
  if (months < 12) return `${months}개월 전`
  return `${years}년 전`
}

export default function CommentItem({
  comment,
  replies,
  slug,
  onReplySuccess,
  onDelete,
  isReply = false,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showDeletePrompt, setShowDeletePrompt] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleReplySuccess = (newComment: CommentResponse) => {
    onReplySuccess(newComment)
    setShowReplyForm(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deletePassword) {
      setDeleteError('비밀번호를 입력해주세요')
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: comment.id, password: deletePassword }),
      })

      if (res.ok) {
        onDelete(comment.id)
        setShowDeletePrompt(false)
        setDeletePassword('')
      } else if (res.status === 403) {
        setDeleteError('비밀번호가 일치하지 않습니다')
      } else {
        setDeleteError('삭제에 실패했습니다')
      }
    } catch {
      setDeleteError('네트워크 오류가 발생했습니다')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeletePrompt(false)
    setDeletePassword('')
    setDeleteError('')
  }

  return (
    <div className={isReply ? 'ml-8' : ''}>
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        {/* Header: nickname + timestamp */}
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {comment.nickname}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Content */}
        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          {comment.content}
        </p>

        {/* Action buttons */}
        <div className="mt-3 flex items-center gap-3">
          {!isReply && (
            <button
              type="button"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-gray-500 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            >
              {showReplyForm ? '취소' : '답글'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDeletePrompt(!showDeletePrompt)}
            className="text-sm text-gray-500 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
          >
            삭제
          </button>
        </div>

        {/* Delete prompt */}
        {showDeletePrompt && (
          <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800/50">
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              삭제하려면 비밀번호를 입력하세요
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value)
                  if (deleteError) setDeleteError('')
                }}
                placeholder="비밀번호"
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDeleteConfirm()
                }}
              />
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '확인'}
              </button>
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                취소
              </button>
            </div>
            {deleteError && (
              <p className="mt-2 text-xs text-red-500">{deleteError}</p>
            )}
          </div>
        )}

        {/* Inline reply form */}
        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              slug={slug}
              parentId={comment.id}
              onSuccess={handleReplySuccess}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              slug={slug}
              onReplySuccess={onReplySuccess}
              onDelete={onDelete}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  )
}
