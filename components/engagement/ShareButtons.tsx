'use client'

import { useState, useEffect } from 'react'
import { Share2, Link as LinkIcon, Check } from 'lucide-react'
import siteMetadata from '@/data/siteMetadata'

interface ShareButtonsProps {
  slug: string
  title: string
}

export default function ShareButtons({ slug, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const postUrl = `${siteMetadata.siteUrl}/blog/${slug}`

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = postUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: postUrl })
      } catch {
        // User cancelled or share failed — no-op
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        aria-label={copied ? 'Link copied' : 'Copy link'}
        className="inline-flex items-center justify-center rounded-full border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-green-600 dark:hover:bg-green-950 dark:hover:text-green-400"
      >
        {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      </button>
      {canNativeShare && (
        <button
          onClick={nativeShare}
          aria-label="Share"
          className="inline-flex items-center justify-center rounded-full border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-purple-300 hover:bg-purple-50 hover:text-purple-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-purple-600 dark:hover:bg-purple-950 dark:hover:text-purple-400"
        >
          <Share2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
