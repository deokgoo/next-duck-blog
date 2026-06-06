// @vitest-environment jsdom
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// IntersectionObserver polyfill for jsdom (must be set before component import)
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    private callback: IntersectionObserverCallback
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
    }
    observe(target: Element) {
      // Simulate immediate intersection
      this.callback(
        [{ isIntersecting: true, target, intersectionRatio: 1 } as IntersectionObserverEntry],
        this
      )
    }
    unobserve() {}
    disconnect() {}
    get root() { return null }
    get rootMargin() { return '' }
    get thresholds() { return [] }
    takeRecords() { return [] }
  } as unknown as typeof IntersectionObserver
})
import CommentWidget from '../CommentWidget'
import CommentForm from '../CommentForm'
import CommentItem from '../CommentItem'

describe('CommentWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders empty state message when there are no comments', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ comments: [] }),
    })

    await act(async () => {
      render(<CommentWidget slug="test-post" />)
    })

    await waitFor(() => {
      expect(
        screen.getByText('아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요')
      ).toBeInTheDocument()
    })
  })

  it('shows loading skeleton state while fetching', async () => {
    let resolvePromise: (value: Response) => void
    const fetchPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve
    })
    global.fetch = vi.fn().mockReturnValue(fetchPromise)

    const { container } = await act(async () => {
      return render(<CommentWidget slug="test-post" />)
    })

    // CommentWidget shows skeleton pulse divs while loading
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)

    // Resolve to clean up
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ comments: [] }),
      } as Response)
    })
  })
})

describe('CommentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates required fields before submit - shows error for empty nickname', async () => {
    const onSuccess = vi.fn()

    await act(async () => {
      render(<CommentForm slug="test-post" onSuccess={onSuccess} />)
    })

    // Submit without filling any fields
    const submitButton = screen.getByRole('button', { name: '댓글 작성' })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(screen.getByText('닉네임을 입력해주세요')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('validates required fields before submit - shows error for short password', async () => {
    const onSuccess = vi.fn()

    await act(async () => {
      render(<CommentForm slug="test-post" onSuccess={onSuccess} />)
    })

    // Fill nickname but leave password short
    const nicknameInput = screen.getByPlaceholderText('닉네임')
    const passwordInput = screen.getByPlaceholderText('비밀번호 (4자 이상)')

    await act(async () => {
      fireEvent.change(nicknameInput, { target: { value: '테스터' } })
      fireEvent.change(passwordInput, { target: { value: '123' } })
    })

    const submitButton = screen.getByRole('button', { name: '댓글 작성' })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(screen.getByText('비밀번호는 4자 이상이어야 합니다')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('validates required fields before submit - shows error for empty content', async () => {
    const onSuccess = vi.fn()

    await act(async () => {
      render(<CommentForm slug="test-post" onSuccess={onSuccess} />)
    })

    // Fill nickname and password but leave content empty
    const nicknameInput = screen.getByPlaceholderText('닉네임')
    const passwordInput = screen.getByPlaceholderText('비밀번호 (4자 이상)')

    await act(async () => {
      fireEvent.change(nicknameInput, { target: { value: '테스터' } })
      fireEvent.change(passwordInput, { target: { value: '1234' } })
    })

    const submitButton = screen.getByRole('button', { name: '댓글 작성' })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(screen.getByText('댓글 내용을 입력해주세요')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('honeypot field is hidden via CSS', async () => {
    const onSuccess = vi.fn()

    const { container } = await act(async () => {
      return render(<CommentForm slug="test-post" onSuccess={onSuccess} />)
    })

    // The honeypot container div should have classes that hide it
    const honeypotContainer = container.querySelector('[aria-hidden="true"]')
    expect(honeypotContainer).not.toBeNull()
    expect(honeypotContainer).toHaveClass('absolute', '-left-[9999px]', 'opacity-0')
  })
})

describe('CommentItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays "방금 전" for comments created less than a minute ago', async () => {
    const now = new Date()
    const comment = {
      id: '1',
      postSlug: 'test-post',
      parentId: null,
      nickname: '테스터',
      content: '테스트 댓글입니다',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    await act(async () => {
      render(
        <CommentItem
          comment={comment}
          replies={[]}
          slug="test-post"
          onReplySuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      )
    })

    expect(screen.getByText('방금 전')).toBeInTheDocument()
  })

  it('displays minutes ago for comments created minutes ago', async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const comment = {
      id: '2',
      postSlug: 'test-post',
      parentId: null,
      nickname: '테스터',
      content: '5분 전 댓글',
      createdAt: fiveMinutesAgo.toISOString(),
      updatedAt: fiveMinutesAgo.toISOString(),
    }

    await act(async () => {
      render(
        <CommentItem
          comment={comment}
          replies={[]}
          slug="test-post"
          onReplySuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      )
    })

    expect(screen.getByText('5분 전')).toBeInTheDocument()
  })

  it('displays hours ago for comments created hours ago', async () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    const comment = {
      id: '3',
      postSlug: 'test-post',
      parentId: null,
      nickname: '테스터',
      content: '3시간 전 댓글',
      createdAt: threeHoursAgo.toISOString(),
      updatedAt: threeHoursAgo.toISOString(),
    }

    await act(async () => {
      render(
        <CommentItem
          comment={comment}
          replies={[]}
          slug="test-post"
          onReplySuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      )
    })

    expect(screen.getByText('3시간 전')).toBeInTheDocument()
  })

  it('displays days ago for comments created days ago', async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const comment = {
      id: '4',
      postSlug: 'test-post',
      parentId: null,
      nickname: '테스터',
      content: '7일 전 댓글',
      createdAt: sevenDaysAgo.toISOString(),
      updatedAt: sevenDaysAgo.toISOString(),
    }

    await act(async () => {
      render(
        <CommentItem
          comment={comment}
          replies={[]}
          slug="test-post"
          onReplySuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      )
    })

    expect(screen.getByText('7일 전')).toBeInTheDocument()
  })

  it('displays months ago for comments created months ago', async () => {
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const comment = {
      id: '5',
      postSlug: 'test-post',
      parentId: null,
      nickname: '테스터',
      content: '2개월 전 댓글',
      createdAt: twoMonthsAgo.toISOString(),
      updatedAt: twoMonthsAgo.toISOString(),
    }

    await act(async () => {
      render(
        <CommentItem
          comment={comment}
          replies={[]}
          slug="test-post"
          onReplySuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      )
    })

    expect(screen.getByText('2개월 전')).toBeInTheDocument()
  })
})
