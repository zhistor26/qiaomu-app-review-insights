import { NextRequest, NextResponse } from 'next/server';
import {
  generateCachedReviewPage,
  readCachedReviewPage,
} from '@/lib/appstore/cache';
import { normalizeCountry } from '@/lib/appstore/discovery';
import { buildReportFilename } from '@/lib/lazycat/report-filename';
import { CachedInsightReportGenerator } from '@/lib/report/cached-insight-report';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string; appId: string }> },
): Promise<NextResponse> {
  try {
    const { country, appId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'markdown';

    if (format !== 'markdown') {
      return NextResponse.json({ error: '仅支持 markdown' }, { status: 400 });
    }

    const normalizedCountry = normalizeCountry(country);
    let page = await readCachedReviewPage(normalizedCountry, appId);

    if (!page) {
      const generated = await generateCachedReviewPage({
        appId,
        country: normalizedCountry,
        maxReviews: 160,
        analyze: true,
      });
      page = generated.page;
    }

    if (!page.stats.totalReviews) {
      return NextResponse.json({ error: '暂无评论样本' }, { status: 404 });
    }

    const markdown = CachedInsightReportGenerator.generate(page);
    const filename = buildReportFilename(page.app.name, new Date());

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Failed to export cached insight report:', error);
    const errorMessage = error instanceof Error ? error.message : '导出报告失败';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
