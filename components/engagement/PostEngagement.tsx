'use client'

import { useEffect, useState } from 'react'
import LikeButton from './LikeButton'

interface PostEngagementProps {
  slug: string
}

export default function PostEngagement({ slug }: PostEngagementProps) {
  const [likes, setLikes] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/engagement/stats?slugs=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        const count = data?.stats?.[slug]?.likes ?? 0
        setLikes(count)
      })
      .catch(() => {
        // Graceful degradation: show 0 likes on error
      })
      .finally(() => {
        setIsLoaded(true)
      })
  }, [slug])

  if (!isLoaded) {
    return (
      <div className="flex items-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 dark:border-gray-700">
          <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center transition-opacity duration-300">
      <LikeButton slug={slug} initialLikes={likes} />
    </div>
  )
}
