/**
 * Bug Condition Exploration Tests - ISR Caching Bug
 *
 * These tests verify the bug exists in the pre-fix code.
 * EXPECTED: All tests FAIL on unfixed code (proving the bug).
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.6
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock 'server-only' to avoid errors in test environment
vi.mock('server-only', () => ({}));

// Mock React's cache() to simulate request-level memoization in test environment
// (React cache() only works inside a React server component render cycle)
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => {
      const cacheMap = new Map<string, any>();
      return ((...args: any[]) => {
        const key = JSON.stringify(args);
        if (cacheMap.has(key)) return cacheMap.get(key);
        const result = fn(...args);
        cacheMap.set(key, result);
        return result;
      }) as unknown as T;
    },
  };
});

// Track how many times db.collection('posts').get() is called
let firebaseGetCallCount = 0;

const mockPostDocs = [
  {
    data: () => ({
      slug: 'test-post-1',
      title: 'Test Post 1',
      date: '2024-01-15T10:00',
      status: 'published',
      tags: ['javascript', 'react'],
      content: 'Test content 1',
      summary: 'Summary 1',
      authors: ['default'],
    }),
  },
  {
    data: () => ({
      slug: 'test-post-2',
      title: 'Test Post 2',
      date: '2024-01-10T10:00',
      status: 'published',
      tags: ['typescript', 'react'],
      content: 'Test content 2',
      summary: 'Summary 2',
      authors: ['default'],
    }),
  },
];

const mockGet = vi.fn(async () => {
  firebaseGetCallCount++;
  return { docs: mockPostDocs, empty: false };
});

const mockWhere = vi.fn(() => ({
  limit: vi.fn(() => ({
    get: mockGet,
  })),
}));

const mockOrderBy = vi.fn(() => ({
  get: mockGet,
}));

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

describe('Bug Condition Exploration: Firebase Duplicate Query Detection', () => {
  beforeEach(() => {
    firebaseGetCallCount = 0;
    mockGet.mockClear();
    mockCollection.mockClear();
    mockOrderBy.mockClear();
    mockWhere.mockClear();

    // Reset module cache so each test gets fresh function instances
    vi.resetModules();
  });

  it('getAllPosts() called 2 times consecutively should only execute Firebase query once (Property 1: Fault Condition)', async () => {
    /**
     * Validates: Requirements 1.2
     *
     * Bug condition: getAllPosts() has no request-level caching,
     * so calling it twice results in 2 Firebase queries.
     * Expected (post-fix): cache() wrapping deduplicates to 1 query.
     */
    const { getAllPosts } = await import('../firestore');

    await getAllPosts();
    await getAllPosts();

    // With proper caching (React cache()), the second call should reuse
    // the cached result, so Firebase should only be queried once.
    expect(firebaseGetCallCount).toBe(1);
  });

  it('getAllPosts() + getAllTags() should use cache so Firebase query executes only once (Property 1: Fault Condition)', async () => {
    /**
     * Validates: Requirements 1.2
     *
     * Bug condition: getAllTags() internally calls getAllPosts(),
     * so calling both results in getAllPosts() executing twice.
     * Expected (post-fix): cache() deduplicates the internal call.
     */
    const { getAllPosts, getAllTags } = await import('../firestore');

    await getAllPosts();
    await getAllTags(); // internally calls getAllPosts() again

    // With proper caching, getAllTags()'s internal getAllPosts() call
    // should reuse the cached result. Total Firebase queries = 1.
    expect(firebaseGetCallCount).toBe(1);
  });

  it('revalidate config value should be a positive number (3600) not false (Property 2: ISR Fault Condition)', async () => {
    /**
     * Validates: Requirements 1.6
     *
     * Bug condition: revalidate = false disables ISR time-based revalidation.
     * Expected (post-fix): revalidate = 3600 enables hourly revalidation.
     */
    // Dynamically read the revalidate exports from blog pages
    // We check the actual file content since these are module-level exports
    const fs = await import('fs');
    const path = await import('path');

    const blogPages = [
      'app/(site)/blog/[...slug]/page.tsx',
      'app/(site)/blog/page.tsx',
      'app/(site)/blog/page/[page]/page.tsx',
    ];

    for (const pagePath of blogPages) {
      const fullPath = path.resolve(process.cwd(), pagePath);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Extract the revalidate value from the file
      const revalidateMatch = content.match(/export\s+const\s+revalidate\s*=\s*(.+?);/);
      expect(revalidateMatch).not.toBeNull();

      const revalidateValue = revalidateMatch![1].trim();

      // revalidate should be a positive number (3600), not 'false'
      expect(revalidateValue).not.toBe('false');

      const numValue = Number(revalidateValue);
      expect(numValue).toBeGreaterThan(0);
    }
  });
});
