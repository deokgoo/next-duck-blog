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
      <div className={`rounded-lg bg-white shadow-v-border dark:bg-transparent dark:shadow-v-border-dark ${className}`}>
        <h3 className="mb-3 text-base font-semibold tracking-[-0.01em] text-ink dark:text-white">
          {displayTitle}
        </h3>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 rounded-md bg-white px-3 py-2 text-sm text-ink shadow-v-border placeholder:text-ink-3 focus:shadow-v-card focus:outline-none dark:bg-transparent dark:text-white dark:shadow-v-border-dark dark:placeholder:text-gray-500 dark:focus:shadow-v-card-dark"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {status === 'loading' ? (language === 'ko' ? '전송중...' : 'Sending...') : (language === 'ko' ? '구독' : 'Subscribe')}
          </button>
        </form>
        {status === 'success' && (
          <p className="mt-2 text-sm text-ink-2 dark:text-gray-400">{message}</p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-sm text-accent-2">{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className={`not-prose my-8 rounded-xl bg-white p-8 shadow-v-card dark:bg-transparent dark:shadow-v-card-dark lg:p-10 ${className}`}>
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-semibold tracking-[-0.02em] text-ink dark:text-white">
          {displayTitle}
        </h2>
        <p className="text-ink-2 dark:text-gray-400">
          {displaySubtitle}
        </p>
      </div>

      {/* 혜택 칩 */}
      {showBenefits && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {t.benefits.map((benefit, index) => (
            <span
              key={index}
              className="rounded-full bg-black/[0.04] px-3 py-1 text-xs text-ink-2 dark:bg-white/10 dark:text-gray-400"
            >
              {benefit}
            </span>
          ))}
        </div>
      )}

      {/* 구독 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 rounded-lg bg-white px-4 py-3 text-ink shadow-v-border placeholder:text-ink-3 focus:shadow-v-card focus:outline-none dark:bg-transparent dark:text-white dark:shadow-v-border-dark dark:placeholder:text-gray-500 dark:focus:shadow-v-card-dark"
            disabled={status === 'loading'}
            required
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className="rounded-lg bg-ink px-6 py-3 font-medium text-white transition-colors hover:bg-ink/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
        <div className="mt-4 rounded-lg bg-ink/[0.03] p-4 shadow-v-border dark:bg-white/5 dark:shadow-v-border-dark">
          <p className="text-sm font-medium text-ink-2 dark:text-gray-400">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 rounded-lg bg-accent-2/[0.05] p-4 shadow-v-border dark:shadow-v-border-dark">
          <p className="text-sm font-medium text-accent-2">{message}</p>
        </div>
      )}

      {/* 개인정보 안내 */}
      <p className="mt-4 text-center text-xs text-ink-3 dark:text-gray-500">
        {language === 'ko'
          ? '개인정보는 뉴스레터 발송 목적으로만 사용되며, 언제든 구독을 해지할 수 있습니다.'
          : 'Your email will only be used for newsletter delivery. You can unsubscribe at any time.'
        }
      </p>
    </div>
  )
}
