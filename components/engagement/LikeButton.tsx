'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { hasLiked, markAsLiked, formatCount } from '@/lib/engagement-client'

interface LikeButtonProps {
  slug: string
  initialLikes?: number
}

export default function LikeButton({ slug, initialLikes = 0 }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setLikes(initialLikes)
  }, [initialLikes])

  useEffect(() => {
    setLiked(hasLiked(slug))
  }, [slug])

  const handleLike = async () => {
    if (liked || isLoading) return

    // Trigger animation
    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)

    // Optimistic update
    setLikes((prev) => prev + 1)
    setLiked(true)
    setIsLoading(true)

    try {
      const res = await fetch('/api/engagement/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })

      if (!res.ok) {
        setLikes((prev) => prev - 1)
        setLiked(false)
      } else {
        markAsLiked(slug)
      }
    } catch {
      setLikes((prev) => prev - 1)
      setLiked(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked || isLoading}
      aria-label={liked ? 'Already liked' : 'Like this post'}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm transition-colors hover:border-pink-300 hover:bg-pink-50 disabled:cursor-default disabled:opacity-70 dark:border-gray-700 dark:hover:border-pink-600 dark:hover:bg-pink-950"
    >
      <Heart
        className={`h-4 w-4 transition-all duration-300 ${
          liked ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400'
        } ${animating ? 'animate-like-heart' : ''}`}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span className="text-gray-700 dark:text-gray-300">{formatCount(likes)}</span>
    </button>
  )
}
