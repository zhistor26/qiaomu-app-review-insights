import { describe, it, expect } from 'vitest';
import { canSaveInsightReport } from '../can-save-insight-report';

describe('canSaveInsightReport', () => {
  it('UT-INS-011: totalReviews=0 → false', () => {
    expect(canSaveInsightReport({ stats: { totalReviews: 0 } })).toBe(false);
  });

  it('UT-INS-012: totalReviews>0 → true', () => {
    expect(canSaveInsightReport({ stats: { totalReviews: 160 } })).toBe(true);
  });
});
