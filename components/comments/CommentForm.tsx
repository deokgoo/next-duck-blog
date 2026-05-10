'use client'

import { useState } from 'react'
import { CommentResponse } from './CommentWidget'

interface CommentFormProps {
  slug: string
  parentId?: string
  onSuccess: (comment: CommentResponse) => void
  onCancel?: () => void
}

export default function CommentForm({ slug, parentId, onSuccess, onCancel }: CommentFormProps) {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isReplyMode = !!parentId

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!nickname.trim()) {
      errors.nickname = '닉네임을 입력해주세요'
    }

    if (password.length < 4) {
      errors.password = '비밀번호는 4자 이상이어야 합니다'
    }

    if (!content.trim()) {
      errors.content = '댓글 내용을 입력해주세요'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const body: Record<string, string | undefined> = {
        slug,
        nickname: nickname.trim(),
        password,
        content: content.trim(),
      }

      if (email.trim()) {
        body.email = email.trim()
      }

      if (parentId) {
        body.parentId = parentId
      }

      if (honeypot) {
        body.honeypot = honeypot
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '댓글 작성에 실패했습니다')
        return
      }

      if (data.success && data.comment) {
        onSuccess(data.comment)
        setNickname('')
        setPassword('')
        setEmail('')
        setContent('')
        setFieldErrors({})
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${isReplyMode ? 'mt-3' : 'mb-8'}`}>
      <div className={`rounded-lg border border-gray-200 p-4 dark:border-gray-700 ${isReplyMode ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}`}>
        <div className={`grid gap-3 ${isReplyMode ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {/* Nickname */}
          <div>
            <label htmlFor={`nickname-${parentId || 'top'}`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              id={`nickname-${parentId || 'top'}`}
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                if (fieldErrors.nickname) setFieldErrors((prev) => ({ ...prev, nickname: '' }))
              }}
              placeholder="닉네임"
              maxLength={30}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            {fieldErrors.nickname && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.nickname}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor={`password-${parentId || 'top'}`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              id={`password-${parentId || 'top'}`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }))
              }}
              placeholder="비밀번호 (4자 이상)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {/* Email (optional) */}
          {!isReplyMode && (
            <div>
              <label htmlFor={`email-${parentId || 'top'}`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                id={`email-${parentId || 'top'}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 (선택)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          )}

          {/* Honeypot - hidden from real users */}
          <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
            <label htmlFor={`website-${parentId || 'top'}`}>Website</label>
            <input
              id={`website-${parentId || 'top'}`}
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Email field in reply mode */}
        {isReplyMode && (
          <div className="mt-3">
            <label htmlFor={`email-${parentId}`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              이메일 <span className="text-gray-400">(선택)</span>
            </label>
            <input
              id={`email-${parentId}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 (선택)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        )}

        {/* Content */}
        <div className="mt-3">
          <label htmlFor={`content-${parentId || 'top'}`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            댓글 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`content-${parentId || 'top'}`}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (fieldErrors.content) setFieldErrors((prev) => ({ ...prev, content: '' }))
            }}
            placeholder="댓글을 입력하세요"
            rows={isReplyMode ? 3 : 4}
            maxLength={1000}
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          {fieldErrors.content && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.content}</p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            {isSubmitting ? '작성 중...' : isReplyMode ? '답글 작성' : '댓글 작성'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
