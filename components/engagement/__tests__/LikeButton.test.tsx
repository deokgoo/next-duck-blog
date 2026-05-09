// @vitest-environment jsdom
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import LikeButton from '../LikeButton'

vi.mock('@/lib/engagement-client', () => ({
  hasLiked: vi.fn(() => false),
  markAsLiked: vi.fn(),
  formatCount: vi.fn((n: number) => String(n)),
}))

import { hasLiked, markAsLiked, formatCount } from '@/lib/engagement-client'

const mockedHasLiked = vi.mocked(hasLiked)
const mockedMarkAsLiked = vi.mocked(markAsLiked)
const mockedFormatCount = vi.mocked(formatCount)

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedHasLiked.mockReturnValue(false)
    mockedFormatCount.mockImplementation((n: number) => String(n))
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Render', () => {
    it('renders with heart icon and initial likes count of 0 by default', async () => {
      await act(async () => {
        render(<LikeButton slug="test-post" />)
      })

      const button = screen.getByRole('button', { name: 'Like this post' })
      expect(button).toBeDefined()
      expect(screen.getByText('0')).toBeDefined()
    })

    it('renders with provided initialLikes value', async () => {
      await act(async () => {
        render(<LikeButton slug="test-post" initialLikes={42} />)
      })

      expect(screen.getByText('42')).toBeDefined()
    })
  })

  describe('Click interaction', () => {
    it('clicking the button triggers a fetch call to /api/engagement/like', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, likes: 1 }),
      })
      global.fetch = fetchMock

      await act(async () => {
        render(<LikeButton slug="my-post" />)
      })

      const button = screen.getByRole('button', { name: 'Like this post' })

      await act(async () => {
        fireEvent.click(button)
      })

      expect(fetchMock).toHaveBeenCalledWith('/api/engagement/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'my-post' }),
      })
    })
  })

  describe('Disabled state', () => {
    it('when localStorage indicates already liked, button is disabled', async () => {
      mockedHasLiked.mockReturnValue(true)

      await act(async () => {
        render(<LikeButton slug="liked-post" initialLikes={5} />)
      })

      const button = screen.getByRole('button', { name: 'Already liked' })
      expect(button).toHaveProperty('disabled', true)
    })
  })

  describe('Optimistic update', () => {
    it('after click, likes count increases immediately before API response', async () => {
      let resolvePromise: (value: Response) => void
      const fetchPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve
      })
      global.fetch = vi.fn().mockReturnValue(fetchPromise)

      await act(async () => {
        render(<LikeButton slug="test-post" initialLikes={10} />)
      })

      expect(screen.getByText('10')).toBeDefined()

      const button = screen.getByRole('button', { name: 'Like this post' })

      await act(async () => {
        fireEvent.click(button)
      })

      // Count should increase optimistically before API resolves
      expect(screen.getByText('11')).toBeDefined()

      // Resolve the fetch
      await act(async () => {
        resolvePromise!({ ok: true, json: () => Promise.resolve({ success: true, likes: 11 }) } as Response)
      })

      expect(screen.getByText('11')).toBeDefined()
      expect(mockedMarkAsLiked).toHaveBeenCalledWith('test-post')
    })
  })

  describe('Rollback on failure', () => {
    it('if API returns error, likes count reverts to previous value', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })

      await act(async () => {
        render(<LikeButton slug="test-post" initialLikes={10} />)
      })

      const button = screen.getByRole('button', { name: 'Like this post' })

      await act(async () => {
        fireEvent.click(button)
      })

      // After API failure, count should revert
      await waitFor(() => {
        expect(screen.getByText('10')).toBeDefined()
      })

      // markAsLiked should NOT have been called
      expect(mockedMarkAsLiked).not.toHaveBeenCalled()
    })

    it('if fetch throws a network error, likes count reverts to previous value', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await act(async () => {
        render(<LikeButton slug="test-post" initialLikes={5} />)
      })

      const button = screen.getByRole('button', { name: 'Like this post' })

      await act(async () => {
        fireEvent.click(button)
      })

      await waitFor(() => {
        expect(screen.getByText('5')).toBeDefined()
      })

      expect(mockedMarkAsLiked).not.toHaveBeenCalled()
    })
  })

  describe('Loading state', () => {
    it('button is disabled during API call to prevent double-clicks', async () => {
      let resolvePromise: (value: Response) => void
      const fetchPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve
      })
      global.fetch = vi.fn().mockReturnValue(fetchPromise)

      await act(async () => {
        render(<LikeButton slug="test-post" initialLikes={3} />)
      })

      const button = screen.getByRole('button', { name: 'Like this post' })
      expect(button).toHaveProperty('disabled', false)

      await act(async () => {
        fireEvent.click(button)
      })

      // Button should be disabled during loading
      const disabledButton = screen.getByRole('button')
      expect(disabledButton).toHaveProperty('disabled', true)

      // Resolve the fetch
      await act(async () => {
        resolvePromise!({ ok: true, json: () => Promise.resolve({ success: true, likes: 4 }) } as Response)
      })

      // After resolution, button stays disabled because it's now "liked"
      const finalButton = screen.getByRole('button', { name: 'Already liked' })
      expect(finalButton).toHaveProperty('disabled', true)
    })
  })
})
