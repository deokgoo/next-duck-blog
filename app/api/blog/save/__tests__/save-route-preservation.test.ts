/**
 * Preservation Property Tests - Duplicate Post Prevention
 *
 * Property 2: Preservation - Slug 미변경 시 기존 저장 동작 보존
 *
 * These tests verify that the CURRENT (unfixed) save behavior is preserved
 * for non-slug-change scenarios. They must PASS on unfixed code and continue
 * to pass after the fix is applied (regression prevention).
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

// --- Mocks ---

const mockSet = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn().mockResolvedValue(undefined);

const mockDoc = vi.fn((slug: string) => ({
  set: mockSet,
  delete: mockDelete,
}));

vi.mock('@/lib/firebaseAdmin', () => ({
  db: {
    collection: vi.fn(() => ({
      doc: mockDoc,
    })),
    runTransaction: vi.fn(),
  },
}));

vi.mock('@/lib/auth/serverAuth', () => ({
  verifyAuth: vi.fn().mockResolvedValue(true),
}));

const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: any[]) => mockRevalidatePath(...args),
}));

// --- Helpers ---

/**
 * Generate a slug from a title (mirrors the logic in route.ts)
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Create a NextRequest-like object for the POST handler.
 */
function createRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/blog/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Arbitrary for generating valid post metadata with a non-empty slug.
 */
const metadataArb = fc
  .record({
    title: fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{2,30}$/),
    date: fc.integer({ min: 2020, max: 2030 }).chain((year) =>
      fc.integer({ min: 1, max: 12 }).chain((month) =>
        fc.integer({ min: 1, max: 28 }).map((day) => {
          const mm = String(month).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          return `${year}-${mm}-${dd}`;
        })
      )
    ),
    tags: fc.array(fc.stringMatching(/^[a-z]{2,10}$/), { minLength: 0, maxLength: 5 }),
    summary: fc.stringMatching(/^[A-Za-z0-9 ]{0,50}$/),
  })
  .filter((m) => generateSlug(m.title).length > 0);

/**
 * Arbitrary for generating post content.
 */
const contentArb = fc.stringMatching(/^[A-Za-z0-9 \n#]{5,100}$/);

describe('Preservation Property: Non-Slug-Change Save Behavior', () => {
  beforeEach(() => {
    mockSet.mockClear();
    mockDelete.mockClear();
    mockDoc.mockClear();
    mockRevalidatePath.mockClear();
  });

  it('Property 2a: New post creation (no previousSlug) → document set at slug, revalidatePath called correctly', async () => {
    /**
     * Validates: Requirements 3.2, 3.3
     *
     * Preservation scenario: When a new post is created (no previousSlug provided),
     * the save API should create a document at the slug derived from the title,
     * and call revalidatePath for the slug path, /blog, and /.
     */
    const { POST } = await import('../route');

    await fc.assert(
      fc.asyncProperty(metadataArb, contentArb, async (metadata, content) => {
        // Clear mocks for each iteration
        mockSet.mockClear();
        mockDelete.mockClear();
        mockDoc.mockClear();
        mockRevalidatePath.mockClear();

        const expectedSlug = generateSlug(metadata.title);

        const requestBody = {
          content,
          metadata: {
            title: metadata.title,
            date: metadata.date,
            createdAt: metadata.date,
            tags: metadata.tags,
            summary: metadata.summary,
          },
          // No previousSlug — new post creation
        };

        const request = createRequest(requestBody);
        const response = await POST(request as any);
        const data = await response.json();

        // Save should succeed
        expect(data.success).toBe(true);
        expect(data.slug).toBe(expectedSlug);

        // Document should be set at the expected slug
        expect(mockDoc).toHaveBeenCalledWith(expectedSlug);
        expect(mockSet).toHaveBeenCalledTimes(1);

        // The set call should contain the correct data shape
        const setCallArg = mockSet.mock.calls[0][0];
        expect(setCallArg.slug).toBe(expectedSlug);
        expect(setCallArg.title).toBe(metadata.title);
        expect(setCallArg.content).toBe(content);

        // No delete should be called (new post, no old document to remove)
        expect(mockDelete).not.toHaveBeenCalled();

        // revalidatePath should be called for slug path, /blog, and /
        const revalidatedPaths = mockRevalidatePath.mock.calls.map((c: any[]) => c[0]);
        expect(revalidatedPaths).toContain(`/blog/${expectedSlug}`);
        expect(revalidatedPaths).toContain('/blog');
        expect(revalidatedPaths).toContain('/');
      }),
      { numRuns: 30, verbose: true }
    );
  });

  it('Property 2b: Content-only update (previousSlug === slug) → document overwritten at same slug, no delete called', async () => {
    /**
     * Validates: Requirements 3.1, 3.3
     *
     * Preservation scenario: When an existing post is saved without changing the title
     * (previousSlug equals the current slug), the save API should overwrite the document
     * at the same slug. No delete should be called.
     */
    const { POST } = await import('../route');

    await fc.assert(
      fc.asyncProperty(metadataArb, contentArb, async (metadata, content) => {
        // Clear mocks for each iteration
        mockSet.mockClear();
        mockDelete.mockClear();
        mockDoc.mockClear();
        mockRevalidatePath.mockClear();

        const slug = generateSlug(metadata.title);

        const requestBody = {
          content,
          metadata: {
            title: metadata.title,
            slug, // Explicitly provide the slug (existing post)
            date: metadata.date,
            createdAt: metadata.date,
            tags: metadata.tags,
            summary: metadata.summary,
          },
          previousSlug: slug, // Same slug — title unchanged
        };

        const request = createRequest(requestBody);
        const response = await POST(request as any);
        const data = await response.json();

        // Save should succeed
        expect(data.success).toBe(true);
        expect(data.slug).toBe(slug);

        // Document should be set at the same slug (overwrite)
        expect(mockDoc).toHaveBeenCalledWith(slug);
        expect(mockSet).toHaveBeenCalledTimes(1);

        // The set call should contain the correct data
        const setCallArg = mockSet.mock.calls[0][0];
        expect(setCallArg.slug).toBe(slug);
        expect(setCallArg.title).toBe(metadata.title);
        expect(setCallArg.content).toBe(content);

        // No delete should be called (slug didn't change)
        expect(mockDelete).not.toHaveBeenCalled();

        // revalidatePath should be called for slug path, /blog, and /
        const revalidatedPaths = mockRevalidatePath.mock.calls.map((c: any[]) => c[0]);
        expect(revalidatedPaths).toContain(`/blog/${slug}`);
        expect(revalidatedPaths).toContain('/blog');
        expect(revalidatedPaths).toContain('/');
      }),
      { numRuns: 30, verbose: true }
    );
  });
});
