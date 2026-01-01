'use client'

import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

interface NewsletterTexts {
  title: string
  subtitle: string
  placeholder: string
  button: string
  success: string
  error: string
  benefits: string[]
}

const texts = {
  ko: {
    title: "새 글 알림 받기",
    subtitle: "실무에서 바로 써먹을 수 있는 개발 팁과 경험담을 받아보세요",
    placeholder: "이메일 주소를 입력해주세요",
    button: "구독하기",
    success: "구독 완료! 곧 첫 번째 이메일을 받아보실 수 있어요",
    error: "구독 처리 중 문제가 발생했어요. 다시 시도해주세요.",
    benefits: [
      "#실무 개발 경험담",
      "#최신 기술 트렌드",
      "#성능 최적화 노하우",
      "#개발 팁과 인사이트"
    ]
  },
  en: {
    title: "Get Updates",
    subtitle: "Get practical development tips and real-world experience",
    placeholder: "Enter your email address",
    button: "Subscribe",
    success: "Successfully subscribed! You'll receive your first email soon",
    error: "Something went wrong. Please try again.",
    benefits: [
      "#Dev Experience",
      "#Tech Trends",
      "#Performance Tips",
      "#Development Insights"
    ]
  }
} as const

interface KoreanNewsletterFormProps {
  language?: 'ko' | 'en'
  compact?: boolean
  showBenefits?: boolean
  className?: string
  title?: string
  subtitle?: string
}

export default function KoreanNewsletterForm({
  language = 'ko',
  compact = false,
  showBenefits = true,
  className = '',
  title,
  subtitle
}: KoreanNewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const t = texts[language]
  const displayTitle = title || t.title
  const displaySubtitle = subtitle || t.subtitle

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(t.success)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || t.error)
      }
    } catch (error) {
      setStatus('error')
      setMessage(t.error)
    }
  }

  if (compact) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {displayTitle}
        </h3>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {status === 'loading' ? '전송중...' : (language === 'ko' ? '구독' : 'Subscribe')}
          </button>
        </form>
        {status === 'success' && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">{message}</p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="not-prose my-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 lg:p-8">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {displayTitle}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          {displaySubtitle}
        </p>
      </div>

      {/* 혜택 칩 */}
      {showBenefits && (
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {t.benefits.map((benefit, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full dark:text-blue-300 dark:bg-blue-900/30"
            >
              {benefit}
            </span>
          ))}
        </div>
      )}

      {/* 구독 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-800"
            disabled={status === 'loading'}
            required
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-green-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {language === 'ko' ? '구독 중...' : 'Subscribing...'}
              </span>
            ) : (
              t.button
            )}
          </button>
        </div>
      </form>

      {/* 상태 메시지 */}
      {status === 'success' && (
        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200 font-medium">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 font-medium">{message}</p>
        </div>
      )}

      {/* 개인정보 안내 */}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        {language === 'ko'
          ? '개인정보는 뉴스레터 발송 목적으로만 사용되며, 언제든 구독을 해지할 수 있습니다.'
          : 'Your email will only be used for newsletter delivery. You can unsubscribe at any time.'
        }
      </p>
    </div>
  )
}