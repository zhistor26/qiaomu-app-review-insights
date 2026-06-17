import { describe, it, expect, vi } from 'vitest';
import { saveCachedInsightReportToDisk } from '../save-insight-report';

describe('saveCachedInsightReportToDisk', () => {
  it('IT-INS-005: mock fetch 200 → 调用 showSaveFilePicker', async () => {
    const markdown = '# 抖音商城 评价分析\n';
    const write = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn().mockResolvedValue(undefined);
    const showSaveFilePicker = vi.fn().mockResolvedValue({
      createWritable: () => Promise.resolve({ write, close }),
    });

    const result = await saveCachedInsightReportToDisk('cn', '645945014', '抖音商城', {
      fetchReport: vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob([markdown], { type: 'text/markdown' })),
      }),
      showSaveFilePicker,
      now: () => new Date('2026-06-17T12:00:00Z'),
    });

    expect(result.mode).toBe('file-picker');
    expect(showSaveFilePicker).toHaveBeenCalledOnce();
  });

  it('IT-INS-006: fetch URL 使用 appstore 路径', async () => {
    const fetchReport = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['# ok'])),
    });
    const showSaveFilePicker = vi.fn().mockResolvedValue({
      createWritable: () => Promise.resolve({ write: vi.fn(), close: vi.fn() }),
    });

    await saveCachedInsightReportToDisk('cn', '645945014', '抖音商城', {
      fetchReport,
      showSaveFilePicker,
    });

    expect(fetchReport).toHaveBeenCalledWith('645945014');
  });

  it('IT-INS-007: fetch 404 → EXPORT_FAILED', async () => {
    await expect(
      saveCachedInsightReportToDisk('cn', 'missing', '抖音商城', {
        fetchReport: vi.fn().mockResolvedValue({ ok: false, status: 404 }),
      }),
    ).rejects.toMatchObject({ code: 'EXPORT_FAILED' });
  });
});
