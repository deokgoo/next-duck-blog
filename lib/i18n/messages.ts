export type Locale = 'ko' | 'en' | 'jp';

const messages = {
  ko: {
    // 댓글
    comments: '댓글',
    noComments: '아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!',
    commentPlaceholder: '댓글을 입력하세요',
    commentLabel: '댓글 내용',
    commentSubmit: '작성',
    commentSubmitting: '전송중...',
    commentError: '댓글 작성에 실패했습니다',
    commentContentRequired: '댓글 내용을 입력해주세요',
    commentSuccess: '댓글이 작성되었습니다',
    reply: '답글',
    replyCancel: '취소',
    delete: '삭제',
    deleteConfirm: '정말 삭제하시겠습니까?',
    nickname: '닉네임',
    password: '비밀번호',
    nicknameRequired: '닉네임을 입력해주세요',
    passwordRequired: '비밀번호를 입력해주세요',

    // 뉴스레터
    newsletterTitle: '새글 알림 받기',
    newsletterSubtitle: '실무 개발 팁과 경험을 받아보세요',
    newsletterPlaceholder: '이메일 주소를 입력하세요',
    newsletterButton: '구독',
    newsletterLoading: '전송중...',
    newsletterSuccess: '구독 완료! 첫 번째 메일을 곧 받으실 수 있습니다',
    newsletterError: '오류가 발생했습니다. 다시 시도해주세요.',
    newsletterPrivacy: '개인정보는 뉴스레터 발송 목적으로만 사용되며, 언제든 구독을 해지할 수 있습니다.',

    // 공통 UI
    readMore: '더 보기',
    allPosts: '전체 글',
    scrollToTop: '맨 위로',
    scrollToComment: '댓글로 이동',
    share: '공유',
    tableOfContents: '목차',
  },
  en: {
    comments: 'Comments',
    noComments: 'No comments yet. Be the first to leave a comment!',
    commentPlaceholder: 'Write a comment...',
    commentLabel: 'Comment',
    commentSubmit: 'Submit',
    commentSubmitting: 'Submitting...',
    commentError: 'Failed to post comment',
    commentContentRequired: 'Please enter a comment',
    commentSuccess: 'Comment posted',
    reply: 'Reply',
    replyCancel: 'Cancel',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this?',
    nickname: 'Nickname',
    password: 'Password',
    nicknameRequired: 'Please enter a nickname',
    passwordRequired: 'Please enter a password',

    newsletterTitle: 'Subscribe to Updates',
    newsletterSubtitle: 'Get practical development tips and real-world experience',
    newsletterPlaceholder: 'Enter your email address',
    newsletterButton: 'Subscribe',
    newsletterLoading: 'Sending...',
    newsletterSuccess: "Successfully subscribed! You'll receive your first email soon",
    newsletterError: 'Something went wrong. Please try again.',
    newsletterPrivacy: 'Your email will only be used for newsletter delivery. You can unsubscribe at any time.',

    readMore: 'Read More',
    allPosts: 'All Posts',
    scrollToTop: 'Scroll to top',
    scrollToComment: 'Scroll to comments',
    share: 'Share',
    tableOfContents: 'Table of Contents',
  },
  jp: {
    comments: 'コメント',
    noComments: 'まだコメントがありません。最初のコメントを残してみましょう！',
    commentPlaceholder: 'コメントを入力してください',
    commentLabel: 'コメント内容',
    commentSubmit: '投稿',
    commentSubmitting: '送信中...',
    commentError: 'コメントの投稿に失敗しました',
    commentContentRequired: 'コメント内容を入力してください',
    commentSuccess: 'コメントが投稿されました',
    reply: '返信',
    replyCancel: 'キャンセル',
    delete: '削除',
    deleteConfirm: '本当に削除しますか？',
    nickname: 'ニックネーム',
    password: 'パスワード',
    nicknameRequired: 'ニックネームを入力してください',
    passwordRequired: 'パスワードを入力してください',

    newsletterTitle: '新着通知を受け取る',
    newsletterSubtitle: '実務的な開発のヒントと経験をお届けします',
    newsletterPlaceholder: 'メールアドレスを入力',
    newsletterButton: '購読',
    newsletterLoading: '送信中...',
    newsletterSuccess: '購読完了！最初のメールをお届けします',
    newsletterError: 'エラーが発生しました。もう一度お試しください。',
    newsletterPrivacy: 'メールアドレスはニュースレター配信のみに使用され、いつでも解除できます。',

    readMore: 'もっと見る',
    allPosts: 'すべての記事',
    scrollToTop: 'トップへ',
    scrollToComment: 'コメントへ',
    share: '共有',
    tableOfContents: '目次',
  },
} as const;

export type MessageKey = keyof (typeof messages)['ko'];

export function getMessages(locale: Locale) {
  return messages[locale] || messages.ko;
}

export function t(locale: Locale, key: MessageKey): string {
  return messages[locale]?.[key] || messages.ko[key];
}

export default messages;
