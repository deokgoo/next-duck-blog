import { describe, it, expect } from 'vitest';
import { filterPostsByTag } from '@/lib/utils/filterPosts';
import { Post } from '@/lib/types';

// Helper to create a minimal Post for testing
function makePost(overrides: Partial<Post> & { slug: string; tags: string[] }): Post {
  return {
    title: overrides.slug,
    date: '2024-01-01',
    summary: '',
    content: '',
    ...overrides,
  };
}

const samplePosts: Post[] = [
  makePost({ slug: 'post-1', tags: ['javascript', 'react'] }),
  makePost({ slug: 'post-2', tags: ['typescript', 'node'] }),
  makePost({ slug: 'post-3', tags: ['react', 'css'] }),
];

describe('filterPostsByTag — unit tests', () => {
  it('returns all posts when tag is null', () => {
    const result = filterPostsByTag(samplePosts, null);
    expect(result).toEqual(samplePosts);
  });

  it('handles empty posts array', () => {
    const result = filterPostsByTag([], 'react');
    expect(result).toEqual([]);
  });

  it('returns empty array when no posts match the tag', () => {
    const result = filterPostsByTag(samplePosts, 'python');
    expect(result).toEqual([]);
  });

  it('filters posts matching the given tag', () => {
    const result = filterPostsByTag(samplePosts, 'react');
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.slug)).toEqual(['post-1', 'post-3']);
  });

  it('matches tags case-insensitively', () => {
    const result = filterPostsByTag(samplePosts, 'REACT');
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.slug)).toEqual(['post-1', 'post-3']);
  });
});

import fc from 'fast-check';

// Arbitrary for generating a Post with random tags
const postArb = fc
  .record({
    slug: fc
      .string({ minLength: 1, maxLength: 20 })
      .map((s) => `post-${s.replace(/[^a-z0-9]/gi, 'x')}`),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 5 }),
    date: fc.constantFrom('2024-01-01', '2024-06-15', '2023-12-01'),
  })
  .map(
    ({ slug, tags, date }): Post => ({
      slug,
      title: slug,
      date,
      summary: '',
      content: '',
      tags,
    })
  );

describe('filterPostsByTag — Property 3: 필터 정확성', () => {
  /**
   * **Validates: Requirements 4.1, 5.2, 5.3**
   *
   * For any list of posts and any tag string, ALL posts in the result must
   * contain that tag (case-insensitive), AND all posts NOT in the result
   * must NOT contain that tag (case-insensitive).
   */
  it('every included post contains the tag and every excluded post does not (case-insensitive)', () => {
    fc.assert(
      fc.property(
        fc.array(postArb, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        (posts, tag) => {
          const result = filterPostsByTag(posts, tag);
          const resultSlugs = new Set(result.map((p) => p.slug));

          // Every post in the result must contain the tag (case-insensitive)
          for (const post of result) {
            const hasTag = post.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
            expect(hasTag).toBe(true);
          }

          // Every post NOT in the result must NOT contain the tag (case-insensitive)
          for (const post of posts) {
            if (!resultSlugs.has(post.slug)) {
              const hasTag = post.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
              expect(hasTag).toBe(false);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('filterPostsByTag — Property 4: 전체 필터 완전성', () => {
  /**
   * **Validates: Requirements 4.2, 5.4**
   *
   * For any list of posts, filterPostsByTag(posts, null) must return
   * the exact same array as the input — the "전체" (All) filter returns
   * everything unchanged.
   */
  it('null filter returns the exact same array as the input', () => {
    fc.assert(
      fc.property(fc.array(postArb, { minLength: 0, maxLength: 20 }), (posts) => {
        const result = filterPostsByTag(posts, null);
        expect(result).toEqual(posts);
        expect(result.length).toBe(posts.length);
      }),
      { numRuns: 100 }
    );
  });
});

describe('filterPostsByTag — Property 5: 정렬 순서 불변성', () => {
  /**
   * **Validates: Requirements 4.6**
   *
   * For any list of posts sorted by date descending and any tag string,
   * the result of filterPostsByTag must also maintain date descending order.
   */

  // Arbitrary that generates posts with random dates via fc.date()
  const postWithDateArb = fc
    .record({
      slug: fc
        .string({ minLength: 1, maxLength: 20 })
        .map((s) => `post-${s.replace(/[^a-z0-9]/gi, 'x')}`),
      tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 5 }),
      date: fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
    })
    .map(
      ({ slug, tags, date }): Post => ({
        slug,
        title: slug,
        date: date.toISOString(),
        summary: '',
        content: '',
        tags,
      })
    );

  it('filtered results preserve date descending order of the input', () => {
    fc.assert(
      fc.property(
        fc.array(postWithDateArb, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        (posts, tag) => {
          // Sort posts by date descending (simulating real pre-sorted input)
          const sorted = [...posts].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          const result = filterPostsByTag(sorted, tag);

          // Assert result is still in date descending order
          for (let i = 1; i < result.length; i++) {
            const prev = new Date(result[i - 1].date).getTime();
            const curr = new Date(result[i].date).getTime();
            expect(prev).toBeGreaterThanOrEqual(curr);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
