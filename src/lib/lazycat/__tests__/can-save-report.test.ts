import { describe, it, expect } from 'vitest';
import { canSaveReport } from '../can-save-report';
import { AggregatedAnalysis } from '@/types';

const baseAnalysis: AggregatedAnalysis = {
  appId: '1',
  totalReviews: 10,
  sentimentDistribution: { positive: 5, negative: 3, neutral: 2 },
  commonIssues: [],
  suggestions: [],
  versionAnalysis: [],
  generatedAt: '2026-06-16T00:00:00.000Z',
};

describe('canSaveReport', () => {
  it('UT-008: totalReviews=0 → false', () => {
    expect(canSaveReport({ ...baseAnalysis, totalReviews: 0 })).toBe(false);
    expect(canSaveReport(null)).toBe(false);
  });

  it('UT-009: totalReviews>0 → true', () => {
    expect(canSaveReport(baseAnalysis)).toBe(true);
  });
});
