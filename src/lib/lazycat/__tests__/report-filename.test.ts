import { describe, it, expect } from 'vitest';
import { buildReportFilename, sanitizeAppName } from '../report-filename';

describe('buildReportFilename', () => {
  it('UT-001: 标准文件名', () => {
    expect(buildReportFilename('ChatGPT', new Date('2026-06-16T12:00:00Z'))).toBe(
      'ChatGPT-分析报告-2026-06-16.md',
    );
  });

  it('UT-002: 非法字符替换', () => {
    expect(buildReportFilename('App/Name:Test', new Date('2026-06-16T12:00:00Z'))).toBe(
      'App-Name-Test-分析报告-2026-06-16.md',
    );
  });

  it('UT-003: appName 为空时用 fallback', () => {
    expect(sanitizeAppName('   ')).toBe('App');
    expect(buildReportFilename('   ', new Date('2026-06-16T12:00:00Z'))).toBe(
      'App-分析报告-2026-06-16.md',
    );
  });
});
