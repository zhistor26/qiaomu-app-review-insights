import { NextRequest, NextResponse } from 'next/server';
import { fetchTopChartApps } from '@/lib/appstore/top-charts';
import { ApiResponse } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '榜单获取失败';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apps = await fetchTopChartApps({
      country: searchParams.get('country') || undefined,
      chart: searchParams.get('chart') || undefined,
      category: searchParams.get('category') || undefined,
      limit: 10,
    });

    return NextResponse.json<ApiResponse<typeof apps>>({
      success: true,
      data: apps,
    });
  } catch (error) {
    console.error('Top charts request failed:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: safeErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
