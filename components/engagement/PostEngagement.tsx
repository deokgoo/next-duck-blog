'use client'

import { useEffect, useState } from 'react'
import LikeButton from './LikeButton'

interface PostEngagementProps {
  slug: string
}

export default function PostEngagement({ slug }: PostEngagementProps) {
  const [likes, setLikes] = useState(0)

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
  }, [slug])

  return (
    <div className="flex items-center">
      <LikeButton slug={slug} initialLikes={likes} />
    </div>
  )
}
