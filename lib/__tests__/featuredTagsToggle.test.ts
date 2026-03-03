import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// Pure toggle functions extracted from ProfileFormClient.tsx logic
function addTag(current: string[], tag: string): string[] {
  if (current.includes(tag)) return current;
  return [...current, tag];
}

function removeTag(current: string[], tag: string): string[] {
  return current.filter((t) => t !== tag);
}

describe('featuredTags toggle — Property 1: 태그 토글 라운드 트립', () => {
  /**
   * **Validates: Requirements 2.2, 2.3**
   *
   * For any featuredTags array of unique strings and any tag NOT already
   * in the array: adding the tag (toggle ON) then removing it (toggle OFF)
   * must return the original array.
   */
  it('add then remove returns the original array (round trip)', () => {
    fc.assert(
      fc.property(
        // Generate an array of unique non-empty strings for featuredTags
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 30 }), {
          minLength: 0,
          maxLength: 10,
        }),
        // Generate a tag string that we'll ensure is NOT in the array
        fc.string({ minLength: 1, maxLength: 30 }),
        (featuredTags, candidateTag) => {
          // Skip if candidateTag is already in the array
          fc.pre(!featuredTags.includes(candidateTag));

          // Toggle ON: add the tag
          const afterAdd = addTag(featuredTags, candidateTag);
          // Toggle OFF: remove the tag
          const afterRemove = removeTag(afterAdd, candidateTag);

          // Round trip: should equal the original
          expect(afterRemove).toEqual(featuredTags);
        }
      ),
      { numRuns: 100 }
    );
  });
});
