/**
 * Preservation Property Tests - ISR Caching Bug
 *
 * These tests verify existing correct behavior (non-bug) that must be
 * preserved after the fix. They run on pre-fix code and should PASS,
 * establishing a baseline.
 *
 * Validates: Requirements 3.1, 3.2, 3.4, 3.7
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Mock 'server-only' to avoid errors in test environment
vi.mock('server-only', () => ({}));

// ---------------------------------------------------------------------------
// Arbitrary generators for Post data
// ---------------------------------------------------------------------------

const statusArb = fc.oneof(
  fc.constant('published' as const),
  fc.constant('deleted' as const),
  fc.constant('draft' as const),
  fc.constant(undefined)
);

/** Generate a date string in the format used by the codebase (YYYY-MM-DDTHH:mm) */
const dateStringArb = fc
  .date({
    min: new Date('2020-01-01T00:00:00Z'),
    max: new Date('2030-12-31T23:59:59Z'),
  })
  .map((d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  });

const tagArb = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), {
    minLength: 1,
    maxLength: 12,
  })
  .map((chars) => chars.join(''));

const slugArb = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')), {
    minLength: 1,
    maxLength: 30,
  })
  .map((chars) => chars.join(''));

const postArb = fc.record({
  slug: slugArb,
  title: fc.string({ minLength: 1, maxLength: 50 }),
  date: dateStringArb,
  tags: fc.array(tagArb, { minLength: 0, maxLength: 5 }),
  summary: fc.string({ minLength: 0, maxLength: 100 }),
  content: fc.string({ minLength: 0, maxLength: 100 }),
  status: statusArb,
  authors: fc.constant(['default']),
});

// ---------------------------------------------------------------------------
// Mock setup: intercept Firestore calls and return generated post data
// ---------------------------------------------------------------------------

let mockPosts: any[] = [];

const mockGet = vi.fn(async () => ({
  docs: mockPosts.map((p) => ({ data: () => p })),
  empty: mockPosts.length === 0,
}));

const mockWhere = vi.fn(() => ({
  limit: vi.fn(() => ({ get: mockGet })),
}));

const mockOrderBy = vi.fn(() => ({ get: mockGet }));

const mockCollection = vi.fn(() => ({
  orderBy: mockOrderBy,
  where: mockWhere,
  get: mockGet,
}));

vi.mock('../firebaseAdmin', () => ({
  db: {
    collection: (...args: any[]) => mockCollection(...args),
  },
}));

// ---------------------------------------------------------------------------
// Import the module under test (after mocks are set up)
// ---------------------------------------------------------------------------

import { getAllPosts, getPostBySlug, getAllTags, isPostPublishedAndReady } from '../firestore';
import type { Post } from '../types';

// ---------------------------------------------------------------------------
// Helper: reference implementations that mirror the source logic
// ---------------------------------------------------------------------------

function referenceIsPostPublishedAndReady(post: Post): boolean {
  if (post.status) {
    if (post.status !== 'published') return false;
  } else {
    const isDraft = (post as any).draft;
    if (isDraft === true || String(isDraft) === 'true') return false;
  }
  if (!post.date) return false;
  return new Date(post.date).getTime() <= Date.now();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Preservation Property: isPostPublishedAndReady() filtering', () => {
  /**
   * **Validates: Requirements 3.2**
   *
   * Property: isPostPublishedAndReady() correctly filters by status,
   * draft flag, and publish date conditions.
   */
  it('should return false for non-published statuses (deleted, draft)', () => {
    fc.assert(
      fc.property(postArb, (postData) => {
        const post = postData as Post;
        const result = isPostPublishedAndReady(post);

        // If status is 'deleted' or 'draft', must return false
        if (post.status === 'deleted' || post.status === 'draft') {
          expect(result).toBe(false);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('should return false for posts with future dates', () => {
    fc.assert(
      fc.property(postArb, (postData) => {
        const post = { ...postData, status: 'published' as const } as Post;
        const result = isPostPublishedAndReady(post);

        if (new Date(post.date).getTime() > Date.now()) {
          expect(result).toBe(false);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('should match reference implementation for all inputs', () => {
    fc.assert(
      fc.property(postArb, (postData) => {
        const post = postData as Post;
        expect(isPostPublishedAndReady(post)).toBe(referenceIsPostPublishedAndReady(post));
      }),
      { numRuns: 300 }
    );
  });
});

describe('Preservation Property: getAllPosts() filtering and sorting', () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockCollection.mockClear();
    mockOrderBy.mockClear();
    mockWhere.mockClear();
  });

  /**
   * **Validates: Requirements 3.1**
   *
   * Property: getAllPosts() returns only posts with status !== 'deleted'
   * and sorts by date descending.
   */
  it('should exclude all deleted posts from results', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(postArb, { minLength: 0, maxLength: 20 }), async (posts) => {
        mockPosts = posts;

        const result = await getAllPosts();

        // No deleted posts in result
        for (const post of result) {
          expect(post.status).not.toBe('deleted');
        }

        // Count: result should have exactly the non-deleted posts
        const expectedCount = posts.filter((p) => p.status !== 'deleted').length;
        expect(result.length).toBe(expectedCount);
      }),
      { numRuns: 100 }
    );
  });

  it('should return posts sorted by date descending (preserving Firestore order after filtering)', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(postArb, { minLength: 0, maxLength: 20 }), async (posts) => {
        // Firestore returns data sorted by date desc via orderBy.
        // Simulate this by pre-sorting the mock data.
        const sorted = [...posts].sort((a, b) => {
          if (a.date > b.date) return -1;
          if (a.date < b.date) return 1;
          return 0;
        });
        mockPosts = sorted;

        const result = await getAllPosts();

        // Verify descending date order is preserved after filtering
        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].date >= result[i].date).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Preservation Property: getPostBySlug() deleted post handling', () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockCollection.mockClear();
    mockOrderBy.mockClear();
    mockWhere.mockClear();
  });

  /**
   * **Validates: Requirements 3.1**
   *
   * Property: getPostBySlug(slug) returns null for posts with status === 'deleted'.
   */
  it('should return null for deleted posts', async () => {
    await fc.assert(
      fc.asyncProperty(postArb, async (postData) => {
        const post = { ...postData, status: 'deleted' as const };
        mockPosts = [post];

        const result = await getPostBySlug(post.slug);
        expect(result).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('should return the post for non-deleted posts', async () => {
    await fc.assert(
      fc.asyncProperty(
        postArb.filter((p) => p.status !== 'deleted'),
        async (postData) => {
          const post = postData as Post;
          mockPosts = [post];

          const result = await getPostBySlug(post.slug);
          expect(result).not.toBeNull();
          expect(result!.slug).toBe(post.slug);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Preservation Property: getAllTags() aggregation', () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockCollection.mockClear();
    mockOrderBy.mockClear();
    mockWhere.mockClear();
  });

  /**
   * **Validates: Requirements 3.7**
   *
   * Property: getAllTags() aggregates tags only from posts that pass
   * isPostPublishedAndReady(), and the counts are correct.
   */
  it('should aggregate tags only from published-and-ready posts', async () => {
    // Use past dates for published posts so isPostPublishedAndReady passes
    const pastDateArb = fc
      .date({
        min: new Date('2020-01-01T00:00:00Z'),
        max: new Date('2024-12-31T23:59:59Z'),
      })
      .map((d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      });

    const taggedPostArb = fc.record({
      slug: fc
        .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')), {
          minLength: 1,
          maxLength: 20,
        })
        .map((chars) => chars.join('')),
      title: fc.string({ minLength: 1, maxLength: 30 }),
      date: pastDateArb,
      tags: fc.array(tagArb, { minLength: 1, maxLength: 5 }),
      summary: fc.constant('summary'),
      content: fc.constant('content'),
      status: statusArb,
      authors: fc.constant(['default']),
    });

    await fc.assert(
      fc.asyncProperty(fc.array(taggedPostArb, { minLength: 0, maxLength: 15 }), async (posts) => {
        mockPosts = posts;

        const result = await getAllTags();

        // Compute expected tags manually using the reference implementation
        const expectedTags: Record<string, number> = {};
        const nonDeletedPosts = posts.filter((p) => p.status !== 'deleted');
        for (const post of nonDeletedPosts) {
          if (!referenceIsPostPublishedAndReady(post as Post)) continue;
          for (const tag of post.tags) {
            const formatted = tag.trim();
            expectedTags[formatted] = (expectedTags[formatted] || 0) + 1;
          }
        }

        expect(result).toEqual(expectedTags);
      }),
      { numRuns: 100 }
    );
  });

  it('should return empty object when no posts pass isPostPublishedAndReady', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          postArb.map((p) => ({ ...p, status: 'deleted' as const })),
          { minLength: 0, maxLength: 10 }
        ),
        async (posts) => {
          mockPosts = posts;

          const result = await getAllTags();
          expect(result).toEqual({});
        }
      ),
      { numRuns: 50 }
    );
  });
});
