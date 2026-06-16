import { AggregatedAnalysis } from '@/types';

export function canSaveReport(analysis: AggregatedAnalysis | null | undefined): boolean {
  return Boolean(analysis && analysis.totalReviews > 0);
}
