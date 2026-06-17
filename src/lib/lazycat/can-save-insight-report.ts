export function canSaveInsightReport(page: { stats: { totalReviews: number } }): boolean {
  return page.stats.totalReviews > 0;
}
