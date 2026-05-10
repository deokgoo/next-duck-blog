'use client'

import { CommentResponse } from './CommentWidget'
import CommentItem from './CommentItem'

interface CommentListProps {
  comments: CommentResponse[]
  slug: string
  onDelete: (id: string) => void
  onReplySuccess: (comment: CommentResponse) => void
}

export default function CommentList({ comments, slug, onDelete, onReplySuccess }: CommentListProps) {
  const topLevelComments = comments.filter((c) => c.parentId === null)

  const getReplies = (parentId: string): CommentResponse[] => {
    return comments.filter((c) => c.parentId === parentId)
  }

  return (
    <div className="mt-6 space-y-6">
      {topLevelComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={getReplies(comment.id)}
          slug={slug}
          onReplySuccess={onReplySuccess}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
