/**
 * Bug Condition Exploration Test - Duplicate Post Prevention
 *
 * Property 1: Fault Condition - Slug 변경 시 이전 문서가 삭제되지 않는 버그
 *
 * EXPECTED: This test FAILS on unfixed code (proving the bug exists).
 * The current save API does not accept `previousSlug` and never deletes old documents.
 *
 * Validates: Requirements 1.1, 1.2, 2.1, 2.2
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

// Track the last transaction object so assertions can inspect it
let lastTransaction: { set: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> } | null =
  null;

const mockRunTransaction = vi.fn(async (fn: (t: any) => Promise<void>) => {
  const transaction = {
    set: vi.fn(),
    delete: vi.fn(),
  };
  lastTransaction = transaction;
  await fn(transaction);
  return transaction;
});

vi.mock('@/lib/firebaseAdmin', () => ({
  db: {
    collection: vi.fn(() => ({
      doc: mockDoc,
    })),
    runTransaction: mockRunTransaction,
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
 * Arbitrary that generates pairs of distinct titles that produce different slugs.
 * This ensures we're always testing the slug-change scenario.
 */
const distinctTitlePairArb = fc
  .tuple(
    fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{2,30}$/),
    fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{2,30}$/)
  )
  .filter(([a, b]) => {
    const slugA = generateSlug(a);
    const slugB = generateSlug(b);
    return slugA !== slugB && slugA.length > 0 && slugB.length > 0;
  });

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

describe('Bug Condition Exploration: Slug Change Leaves Orphan Documents', () => {
  beforeEach(() => {
    mockSet.mockClear();
    mockDelete.mockClear();
    mockDoc.mockClear();
    mockRunTransaction.mockClear();
    mockRevalidatePath.mockClear();
    lastTransaction = null;
  });

  it('Property 1: When previousSlug differs from new slug, old document should be deleted (Fault Condition)', async () => {
    /**
     * Validates: Requirements 1.1, 1.2, 2.1, 2.2
     *
     * Bug condition: The save API does not accept `previousSlug` and never
     * deletes old documents when the slug changes. This means renaming a post
     * title creates a new document while leaving the old one as an orphan.
     *
     * Expected (post-fix): When previousSlug is provided and differs from the
     * new slug, the API should delete the old document and create the new one,
     * ensuring only one document exists per post.
     */
    const { POST } = await import('../route');

    await fc.assert(
      fc.asyncProperty(distinctTitlePairArb, async ([originalTitle, newTitle]) => {
        // Clear mocks for each property iteration
        mockSet.mockClear();
        mockDelete.mockClear();
        mockDoc.mockClear();
        mockRunTransaction.mockClear();
        mockRevalidatePath.mockClear();
        lastTransaction = null;

        const oldSlug = generateSlug(originalTitle);
        const newSlug = generateSlug(newTitle);

        const requestBody = {
          content: '# Test Content\n\nSome body text.',
          metadata: {
            title: newTitle,
            date: '2024-01-15',
            createdAt: '2024-01-15',
            tags: ['test'],
            summary: 'Test summary',
          },
          previousSlug: oldSlug,
        };

        const request = createRequest(requestBody);
        const response = await POST(request as any);
        const data = await response.json();

        // The save should succeed
        expect(data.success).toBe(true);

        // CRITICAL ASSERTIONS:
        // 1. The old document at previousSlug should be deleted
        //    (either via direct delete or via transaction)
        const transactionDeleteCalled =
          mockRunTransaction.mock.calls.length > 0 &&
          lastTransaction !== null &&
          lastTransaction.delete.mock.calls.length > 0;

        const directDeleteCalled =
          mockDoc.mock.calls.some((call: any[]) => call[0] === oldSlug) &&
          mockDelete.mock.calls.length > 0;

        expect(transactionDeleteCalled || directDeleteCalled).toBe(true);

        // 2. revalidatePath should be called for the old slug path
        const revalidatedPaths = mockRevalidatePath.mock.calls.map((c: any[]) => c[0]);
        expect(revalidatedPaths).toContain(`/blog/${oldSlug}`);

        // 3. revalidatePath should also be called for the new slug path
        expect(revalidatedPaths).toContain(`/blog/${newSlug}`);
      }),
      { numRuns: 20, verbose: true }
    );
  });
});
