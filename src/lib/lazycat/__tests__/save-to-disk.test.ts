import { describe, it, expect, vi } from 'vitest';
import { saveMarkdownReportToDisk } from '../save-to-disk';

describe('saveMarkdownReportToDisk', () => {
  it('IT-005: 成功拉报告并打开保存选择器', async () => {
    const markdown = '# Test 用户评论分析报告\n';
    const write = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn().mockResolvedValue(undefined);
    const showSaveFilePicker = vi.fn().mockResolvedValue({
      createWritable: () => Promise.resolve({ write, close }),
    });

    const result = await saveMarkdownReportToDisk('app-1', 'Test', {
      fetchReport: vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob([markdown], { type: 'text/markdown' })),
      }),
      showSaveFilePicker,
      now: () => new Date('2026-06-16T12:00:00Z'),
    });

    expect(result.mode).toBe('file-picker');
    expect(showSaveFilePicker).toHaveBeenCalledOnce();
    expect(write).toHaveBeenCalledOnce();
    const written = write.mock.calls[0][0] as Blob;
    expect(await written.text()).toBe(markdown);
  });

  it('IT-006: mock fetch 404 → EXPORT_FAILED', async () => {
    await expect(
      saveMarkdownReportToDisk('missing', 'Test', {
        fetchReport: vi.fn().mockResolvedValue({ ok: false, status: 404 }),
      }),
    ).rejects.toMatchObject({ code: 'EXPORT_FAILED' });
  });

  it('IT-007: picker AbortError → USER_CANCELLED', async () => {
    await expect(
      saveMarkdownReportToDisk('app-1', 'Test', {
        fetchReport: vi.fn().mockResolvedValue({
          ok: true,
          blob: () => Promise.resolve(new Blob(['# ok'])),
        }),
        showSaveFilePicker: vi.fn().mockRejectedValue({ name: 'AbortError' }),
      }),
    ).rejects.toMatchObject({ code: 'USER_CANCELLED' });
  });

  it('UT-007: 无 showSaveFilePicker → fallback-download', async () => {
    const downloadBlobFn = vi.fn();
    const result = await saveMarkdownReportToDisk('app-1', 'Test', {
      fetchReport: vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['# ok'])),
      }),
      showSaveFilePicker: undefined,
      downloadBlobFn,
      now: () => new Date('2026-06-16T12:00:00Z'),
    });

    expect(result.mode).toBe('fallback-download');
    expect(downloadBlobFn).toHaveBeenCalledOnce();
  });

  it('IT-008: writable.write 收到与 fetch body 相同字节', async () => {
    const body = '# ChatGPT 用户评论分析报告\n\n总评论 9';
    const write = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn().mockResolvedValue(undefined);

    await saveMarkdownReportToDisk('app-1', 'ChatGPT', {
      fetchReport: vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob([body], { type: 'text/markdown' })),
      }),
      showSaveFilePicker: vi.fn().mockResolvedValue({
        createWritable: () => Promise.resolve({ write, close }),
      }),
    });

    const written = write.mock.calls[0][0] as Blob;
    expect(await written.text()).toBe(body);
  });

  it('WRITE_FAILED 非取消错误', async () => {
    await expect(
      saveMarkdownReportToDisk('app-1', 'Test', {
        fetchReport: vi.fn().mockResolvedValue({
          ok: true,
          blob: () => Promise.resolve(new Blob(['# ok'])),
        }),
        showSaveFilePicker: vi.fn().mockRejectedValue(new Error('disk full')),
      }),
    ).rejects.toMatchObject({ code: 'WRITE_FAILED' });
  });
});
