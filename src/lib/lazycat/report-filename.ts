const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

export function sanitizeAppName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'App';
  return trimmed.replace(INVALID_FILENAME_CHARS, '-').replace(/\s+/g, ' ').trim() || 'App';
}

export function formatReportDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function buildReportFilename(appName: string, date: Date = new Date()): string {
  return `${sanitizeAppName(appName)}-分析报告-${formatReportDate(date)}.md`;
}
