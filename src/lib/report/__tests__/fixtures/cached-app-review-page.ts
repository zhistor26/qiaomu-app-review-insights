import type { CachedAppReviewPage } from '@/lib/appstore/cache';

export const douyinFixture: CachedAppReviewPage = {
  cacheVersion: 1,
  cacheKey: 'cn:645945014',
  pagePath: '/apps/cn/645945014/douyin-shopping',
  canonicalUrl: 'https://appreview.example/apps/cn/645945014',
  app: {
    id: '645945014',
    name: '抖音商城',
    country: 'cn',
    artistName: 'Beijing Douyin Technology Co., Ltd.',
    artworkUrl: '',
    primaryGenreName: 'Shopping',
    trackViewUrl: 'https://apps.apple.com/cn/app/id645945014',
  },
  candidates: [],
  source: 'lookup',
  stats: {
    totalReviews: 160,
    averageRating: 2.03,
    ratingDistribution: { '5': 32, '4': 9, '3': 3, '2': 4, '1': 112 },
    versionDistribution: [
      { version: '39.1.0', count: 99, averageRating: 1.89 },
      { version: '38.9.0', count: 42, averageRating: 2.31 },
    ],
    negativeShare: 0.725,
    positiveShare: 0.2625,
  },
  reviews: [
    {
      id: 'r1',
      title: '东西比拼xx的贵也就算了',
      content: '质量差 东西贵，售后差 官方平台就是个摆设',
      rating: '1',
      version: '39.1.0',
      updated: '2026-06-15T11:37:00.000Z',
      authorName: '抖某差劲',
      country: 'cn',
      source: 'apple-rss',
      sourceCountry: 'cn',
    },
    {
      id: 'r2',
      title: '虚假宣传',
      content: '下载说送新人5元券，实际无法使用',
      rating: '1',
      version: '39.1.0',
      updated: '2026-06-14T18:15:00.000Z',
      authorName: '测试用户',
      country: 'cn',
      source: 'apple-rss',
      sourceCountry: 'cn',
    },
  ],
  sourceBreakdown: {
    total: 160,
    rssCount: 160,
    htmlCount: 0,
    unknownCount: 0,
    countryCount: 1,
    countries: [{ country: 'cn', count: 160, rssCount: 160, htmlCount: 0 }],
    note: 'RSS 提供所选国家/地区的最近评论；页面补样本不代表全量评论库。',
  },
  diagnostics: {
    versionTrend: [],
    issueThemes: [],
    issueHeatmap: [],
    sentimentTimeline: [],
    sampleSize: 160,
    insights: [
      {
        label: '高风险版本',
        value: '39.1.0',
        description: '99 条评论中差评占比 76.8%',
        tone: 'rose',
      },
    ],
  },
  insights: {
    executiveSummary:
      '抖音商城App整体口碑极差，平均评分仅2.03，1星占比70%。用户主要投诉虚假宣传、售后无能。',
    painPoints: [
      {
        title: '虚假优惠诱导下载',
        summary: '用户因广告宣称的优惠券下载，实际无法使用或金额缩水。',
        evidence: '下载说送新人5元券，第二天打开发现后面两张优惠券都没有了。',
        priority: 'high',
      },
    ],
    opportunities: [
      {
        title: '明确优惠使用规则',
        summary: '简化优惠券的使用条件和有效期，避免误导。',
        priority: 'high',
      },
    ],
    positiveSignals: [],
    userSegments: [],
    versionRisks: [],
    actionPlan: [
      {
        title: '清理虚假广告',
        summary: '立即审核所有拉新广告，确保优惠可兑现。',
        priority: 'high',
      },
    ],
    queryAngles: [],
    model: 'deepseek-v4-flash',
    generatedAt: '2026-06-16T23:32:00.000Z',
  },
  model: { provider: 'deepseek', model: 'deepseek-v4-flash' },
  generatedAt: '2026-06-16T23:32:00.000Z',
  updatedAt: '2026-06-16T23:32:00.000Z',
  reviewSampleSize: 160,
  maxReviews: 160,
};

export const emptyInsightsFixture: CachedAppReviewPage = {
  ...douyinFixture,
  insights: null,
};
