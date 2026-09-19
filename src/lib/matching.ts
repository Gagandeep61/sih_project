import { MatchScoreResult, Problem, UserProfile } from '../types';

/**
 * Deterministic Matching Engine (SIH26043 - Team LIMITLESS)
 * Evaluates institutions using an explainable 100-point scoring formula:
 * Score = Domain Overlap (50 pts) + District Match (30 pts) + Facility/Expertise Keyword Match (up to 20 pts)
 */
export function calculateMatchScore(problem: Problem, university: UserProfile): MatchScoreResult {
  let domainScore = 0;
  const domainOverlap: string[] = [];

  if (university.domain_tags && university.domain_tags.includes(problem.domain)) {
    domainScore = 50;
    domainOverlap.push(problem.domain);
  }

  // District match
  let districtScore = 0;
  const districtMatch =
    Boolean(university.district) &&
    university.district?.trim().toLowerCase() === problem.district.trim().toLowerCase();

  if (districtMatch) {
    districtScore = 30;
  }

  // Facility and expertise keyword matching (up to 20 pts)
  const fullText = `${problem.title} ${problem.description}`.toLowerCase();
  const univText = `${university.facilities || ''} ${university.expertise || ''}`.toLowerCase();

  // Extract relevant non-trivial words (>3 chars)
  const problemWords = fullText
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4);

  const matchedKeywords: string[] = [];
  let keywordHits = 0;

  for (const word of problemWords) {
    if (univText.includes(word) && !matchedKeywords.includes(word)) {
      matchedKeywords.push(word);
      keywordHits += 5; // 5 pts per distinct technical keyword
      if (keywordHits >= 20) break;
    }
  }

  const keywordScore = Math.min(20, keywordHits);
  const totalScore = domainScore + districtScore + keywordScore;

  const reasons: string[] = [];
  if (domainScore > 0) {
    reasons.push(`+50 pts: Direct domain specialization in "${problem.domain}"`);
  }
  if (districtScore > 0) {
    reasons.push(`+30 pts: Local ground presence in "${problem.district}" district`);
  }
  if (matchedKeywords.length > 0) {
    reasons.push(
      `+${keywordScore} pts: Technical lab & research synergy (${matchedKeywords.slice(0, 3).join(', ')})`,
    );
  }
  if (reasons.length === 0) {
    reasons.push('General interdisciplinary capacity available for state allocation');
  }

  return {
    totalScore,
    domainScore,
    districtScore,
    keywordScore,
    domainOverlap,
    districtMatch,
    matchedKeywords,
    explanation: reasons.join(' • '),
  };
}
