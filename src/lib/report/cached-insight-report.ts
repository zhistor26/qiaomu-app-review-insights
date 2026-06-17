import type { ReviewMiningItem } from '@/lib/analysis/kimi-client';
import type { CachedAppReviewPage } from '@/lib/appstore/cache';

function reviewSourceLabel(source?: string, country?: string): string {
  const sourceText = source === 'app-store-html'
    ? '页面补样本'
    : source === 'apple-rss'
      ? 'RSS 最近评论'
      : '来源待识别';
  const countryText = country ? ` · ${country.toUpperCase()}` : '';
  return `${sourceText}${countryText}`;
}

const INSIGHT_SECTIONS: Array<{
  key: keyof NonNullable<CachedAppReviewPage['insights']>;
  title: string;
}> = [
  { key: 'painPoints', title: '核心痛点（Problem）' },
  { key: 'opportunities', title: '产品机会（Opportunity）' },
  { key: 'positiveSignals', title: '正向信号（Strength）' },
  { key: 'userSegments', title: '用户分层（Audience）' },
  { key: 'versionRisks', title: '版本风险（Risk）' },
  { key: 'actionPlan', title: '行动建议（Action）' },
];

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

function formatPageDate(value?: string): string {
  if (!value) return '未知';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未知';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatInsightItems(items: ReviewMiningItem[] | undefined): string {
  if (!items?.length) {
    return '_暂无明显信号。_\n';
  }

  return items
    .map((item) => {
      const priority = PRIORITY_LABEL[item.priority || 'medium'] || '中';
      const lines = [
        `#### ${item.title}`,
        `- **优先级**: ${priority}`,
        `- **摘要**: ${item.summary}`,
      ];
      if (item.evidence) {
        lines.push(`- **证据**: ${item.evidence}`);
      }
      return lines.join('\n');
    })
    .join('\n\n');
}

function formatRatingDistribution(stats: CachedAppReviewPage['stats']): string {
  return [5, 4, 3, 2, 1]
    .map((rating) => `- ${rating} 星: ${stats.ratingDistribution[String(rating)] || 0}`)
    .join('\n');
}

function formatSourceBreakdown(page: CachedAppReviewPage): string {
  const breakdown = page.sourceBreakdown;
  if (!breakdown || breakdown.total === 0) {
    return '_暂无数据来源明细。_\n';
  }

  const countrySummary = breakdown.countries
    .slice(0, 6)
    .map((item) => `${item.country.toUpperCase()} ${item.count}`)
    .join(' · ');

  return [
    `- RSS 最近评论: ${breakdown.rssCount}`,
    `- 页面补样本: ${breakdown.htmlCount}`,
    `- Storefront 覆盖: ${breakdown.countryCount} 个（${countrySummary || '暂无'}）`,
    `- 样本说明: ${breakdown.note}`,
  ].join('\n');
}

function formatDiagnostics(page: CachedAppReviewPage): string {
  const diagnostics = page.diagnostics;
  if (!diagnostics?.insights?.length) {
    return '_暂无版本诊断摘要。_\n';
  }

  return diagnostics.insights
    .map((item) => `- **${item.label}**: ${item.value} — ${item.description}`)
    .join('\n');
}

function formatVersionSamples(stats: CachedAppReviewPage['stats']): string {
  if (!stats.versionDistribution.length) {
    return '_暂无版本样本。_\n';
  }

  return stats.versionDistribution
    .map((version) => `- ${version.version}: ${version.count} 条 · ${version.averageRating} 星`)
    .join('\n');
}

function formatReviewEvidence(page: CachedAppReviewPage): string {
  if (!page.reviews.length) {
    return '_暂无评论证据。_\n';
  }

  return page.reviews
    .map((review) => {
      const meta = [
        review.version || 'Unknown',
        formatPageDate(review.updated),
        review.authorName || '匿名',
        reviewSourceLabel(review.source, review.sourceCountry || review.country),
      ].join(' · ');

      return [`#### ${review.title}（${review.rating} 星）`, `- ${meta}`, '', review.content].join('\n');
    })
    .join('\n\n');
}

export class CachedInsightReportGenerator {
  static generate(page: CachedAppReviewPage): string {
    const { app, stats, insights } = page;
    const summarySection = insights?.executiveSummary?.trim()
      ? insights.executiveSummary.trim()
      : '_AI 洞察暂未生成；以下为评论统计与证据样本。_';

    const insightSections = INSIGHT_SECTIONS.map(({ key, title }) => {
      const items = insights?.[key];
      if (!Array.isArray(items)) {
        return `### ${title}\n\n_暂无明显信号。_\n`;
      }
      return `### ${title}\n\n${formatInsightItems(items as ReviewMiningItem[])}`;
    }).join('\n\n');

    return `# ${app.name} 评价分析

## 元信息

- **应用名称**: ${app.name}
- **App ID**: ${app.id}
- **国家/地区**: ${app.country.toUpperCase()}
- **开发者**: ${app.artistName || 'App Store'}
- **页面链接**: ${page.canonicalUrl}
- **更新时间**: ${formatPageDate(page.updatedAt)}
- **报告生成时间**: ${formatPageDate(new Date().toISOString())}
- **分析模型**: ${page.model?.model || insights?.model || '评论统计'}

## 样本概览

- **样本均分**: ${stats.averageRating || '0.00'} / 5
- **评论样本**: ${stats.totalReviews}
- **差评占比**: ${formatPercent(stats.negativeShare)}
- **好评占比**: ${formatPercent(stats.positiveShare)}

### 星级分布

${formatRatingDistribution(stats)}

## 数据来源

${formatSourceBreakdown(page)}

## 摘要

${summarySection}

## 版本与口碑诊断

${formatDiagnostics(page)}

### 版本样本

${formatVersionSamples(stats)}

## 洞察矩阵

${insightSections}

## 评论证据

${formatReviewEvidence(page)}

## 附录

- 本报告由乔木 App 洞察根据 App Store 公开评论与 AI 聚合分析自动生成。
- 页面保留摘要、证据、痛点和行动项；每个判断尽量回到原始评论样本。
- 数据更新方式：在洞察页点击「更新洞察」可抓取最新评论并刷新分析结论。
- RSS 提供所选国家/地区的最近评论；页面补样本来自 Apple 页面展示块，不代表全量评论库。

---

*导出时间：${formatPageDate(new Date().toISOString())}*
`;
  }
}
