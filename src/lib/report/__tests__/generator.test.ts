import { describe, it, expect } from 'vitest';
import { ReportGenerator } from '../generator';
import { App, AggregatedAnalysis } from '@/types';

const app: App = { id: '6448311069', name: 'ChatGPT', country: 'us' };

const analysis: AggregatedAnalysis = {
  appId: app.id,
  totalReviews: 42,
  sentimentDistribution: { positive: 20, negative: 12, neutral: 10 },
  commonIssues: [{ issue: '登录慢', count: 5, examples: ['太慢了'] }],
  suggestions: [{ suggestion: '增加暗色模式', count: 3, examples: ['想要深色'] }],
  versionAnalysis: [],
  generatedAt: '2026-06-16T00:00:00.000Z',
};

describe('ReportGenerator', () => {
  it('UT-010: markdown 含标题', () => {
    const md = ReportGenerator.generateMarkdownReport(app, analysis);
    expect(md).toContain('# ChatGPT 用户评论分析报告');
  });

  it('UT-011: markdown 含 totalReviews', () => {
    const md = ReportGenerator.generateMarkdownReport(app, analysis);
    expect(md).toContain('42');
    expect(md).toContain('分析评论总数');
  });

  it('UT-012: html / summary 非空', () => {
    expect(ReportGenerator.generateHtmlReport(app, analysis).length).toBeGreaterThan(100);
    expect(ReportGenerator.generateSummaryReport(app, analysis)).toContain('ChatGPT');
  });
});
