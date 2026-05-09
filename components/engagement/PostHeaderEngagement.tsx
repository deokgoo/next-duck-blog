'use client'

import PostEngagement from './PostEngagement'
import ShareButtons from './ShareButtons'

interface PostHeaderEngagementProps {
  slug: string
  title: string
}

export default function PostHeaderEngagement({ slug, title }: PostHeaderEngagementProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <PostEngagement slug={slug} />
      <ShareButtons slug={slug} title={title} />
    </div>
  )
}
