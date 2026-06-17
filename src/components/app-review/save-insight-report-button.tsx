'use client';

import { useState } from 'react';
import { HardDriveUpload, RefreshCw } from 'lucide-react';
import { canSaveInsightReport } from '@/lib/lazycat/can-save-insight-report';
import { saveCachedInsightReportToDisk } from '@/lib/lazycat/save-insight-report';
import { SaveReportError } from '@/lib/lazycat/save-to-disk-errors';

interface SaveInsightReportButtonProps {
  country: string;
  appId: string;
  appName: string;
  totalReviews: number;
}

export function SaveInsightReportButton({
  country,
  appId,
  appName,
  totalReviews,
}: SaveInsightReportButtonProps) {
  const [saving, setSaving] = useState(false);
  const enabled = canSaveInsightReport({ stats: { totalReviews } });

  const saveToDisk = async () => {
    if (!enabled) {
      alert('暂无评论样本，请先更新洞察');
      return;
    }

    try {
      setSaving(true);
      const result = await saveCachedInsightReportToDisk(country, appId, appName);
      if (result.mode === 'fallback-download') {
        alert('当前环境不支持网盘选择器，已改为本地下载');
      }
    } catch (error) {
      if (error instanceof SaveReportError && error.code === 'USER_CANCELLED') {
        return;
      }
      const message = error instanceof Error ? error.message : '保存至网盘失败';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={saveToDisk}
      disabled={!enabled || saving}
      title={enabled ? '保存至懒猫网盘' : '暂无评论样本'}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          保存中…
        </>
      ) : (
        <>
          <HardDriveUpload className="h-4 w-4" />
          保存至懒猫网盘
        </>
      )}
    </button>
  );
}
