import { describe, it, expect } from 'vitest';
import { CachedInsightReportGenerator } from '../cached-insight-report';
import { douyinFixture, emptyInsightsFixture } from './fixtures/cached-app-review-page';

describe('CachedInsightReportGenerator', () => {
  it('UT-INS-001: 含评价分析标题', () => {
    const md = CachedInsightReportGenerator.generate(douyinFixture);
    expect(md).toContain('# 抖音商城 评价分析');
  });

  it('UT-INS-002: 样本概览数字与 page 一致', () => {
    const md = CachedInsightReportGenerator.generate(douyinFixture);
    expect(md).toContain('160');
    expect(md).toContain('2.03');
    expect(md).toContain('73%');
  });

  it('UT-INS-003: 含 executiveSummary', () => {
    const md = CachedInsightReportGenerator.generate(douyinFixture);
    expect(md).toContain('抖音商城App整体口碑极差');
  });

  it('UT-INS-004: 含洞察矩阵章节', () => {
    const md = CachedInsightReportGenerator.generate(douyinFixture);
    expect(md).toContain('核心痛点（Problem）');
    expect(md).toContain('产品机会（Opportunity）');
    expect(md).toContain('行动建议（Action）');
  });

  it('UT-INS-005: 含评论证据', () => {
    const md = CachedInsightReportGenerator.generate(douyinFixture);
    expect(md).toContain('东西比拼xx的贵也就算了');
    expect(md).toContain('1 星');
  });

  it('UT-INS-006: 含页面链接', () => {
    const md = CachedInsightReportGenerator.generate(douyinFixture);
    expect(md).toContain('https://appreview.example/apps/cn/645945014');
  });

  it('UT-INS-007: 含数据来源', () => {
    const md = CachedInsightReportGenerator.generate(douyinFixture);
    expect(md).toContain('RSS 最近评论: 160');
  });

  it('UT-INS-008: 含版本诊断', () => {
    const md = CachedInsightReportGenerator.generate(douyinFixture);
    expect(md).toContain('高风险版本');
    expect(md).toContain('39.1.0');
  });

  it('UT-INS-009: insights=null 时使用占位摘要', () => {
    const md = CachedInsightReportGenerator.generate(emptyInsightsFixture);
    expect(md).toContain('AI 洞察暂未生成');
    expect(md).toContain('160');
  });

  it('UT-INS-010: 评论证据条数不超过 page.reviews', () => {
    const md = CachedInsightReportGenerator.generate(douyinFixture);
    const matches = md.match(/#### .+（\d 星）/g) ?? [];
    expect(matches.length).toBeLessThanOrEqual(douyinFixture.reviews.length);
  });
});
