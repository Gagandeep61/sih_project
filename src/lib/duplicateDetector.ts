import { Problem } from '../types';

/**
 * Token overlap Jaccard similarity for real-time duplicate problem detection
 */
export function findPotentialDuplicates(
  title: string,
  district: string,
  existingProblems: Problem[],
): { problem: Problem; similarity: number }[] {
  if (!title || title.trim().length < 5) return [];

  const tokenize = (text: string) =>
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !['with', 'from', 'have', 'been', 'this', 'that', 'over', 'into'].includes(w)),
    );

  const inputTokens = tokenize(title);
  if (inputTokens.size === 0) return [];

  const results: { problem: Problem; similarity: number }[] = [];

  for (const item of existingProblems) {
    // Only check problems in the same district or across all if district not chosen yet
    if (district && item.district.toLowerCase() !== district.toLowerCase()) {
      continue;
    }

    const itemTokens = tokenize(`${item.title} ${item.description}`);
    const intersection = new Set([...inputTokens].filter((x) => itemTokens.has(x)));
    const union = new Set([...inputTokens, ...itemTokens]);

    const similarity = union.size === 0 ? 0 : intersection.size / union.size;

    // Threshold for duplicate warning
    if (similarity >= 0.25) {
      results.push({ problem: item, similarity });
    }
  }

  return results.sort((a, b) => b.similarity - a.similarity);
}
