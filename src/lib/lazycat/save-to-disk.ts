import { buildReportFilename } from './report-filename';
import { downloadBlob } from './download-blob';
import { isUserCancelled, mapExportHttpStatus, SaveReportError } from './save-to-disk-errors';

export type SaveResultMode = 'file-picker' | 'fallback-download';

export interface SaveResult {
  mode: SaveResultMode;
  filename: string;
}

type ShowSaveFilePicker = (options: {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
}) => Promise<{
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
}>;

export interface SaveMarkdownDeps {
  fetchReport?: (appId: string) => Promise<Response>;
  showSaveFilePicker?: ShowSaveFilePicker;
  downloadBlobFn?: (blob: Blob, filename: string) => void;
  now?: () => Date;
}

const defaultFetchReport = (appId: string) =>
  fetch(`/api/apps/${appId}/export-report?format=markdown`);

export async function saveMarkdownReportToDisk(
  appId: string,
  appName: string,
  deps: SaveMarkdownDeps = {},
): Promise<SaveResult> {
  const fetchReport = deps.fetchReport ?? defaultFetchReport;
  const now = deps.now ?? (() => new Date());
  const filename = buildReportFilename(appName, now());

  const response = await fetchReport(appId);
  if (!response.ok) {
    throw mapExportHttpStatus(response.status);
  }

  const blob = await response.blob();
  const picker = deps.showSaveFilePicker ?? getShowSaveFilePicker();

  if (!picker) {
    const download = deps.downloadBlobFn ?? downloadBlob;
    download(blob, filename);
    return { mode: 'fallback-download', filename };
  }

  try {
    const handle = await picker({
      suggestedName: filename,
      types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return { mode: 'file-picker', filename };
  } catch (error) {
    if (isUserCancelled(error)) {
      throw new SaveReportError('USER_CANCELLED', '已取消保存');
    }
    throw new SaveReportError('WRITE_FAILED', '保存失败，请重试');
  }
}

function getShowSaveFilePicker(): ShowSaveFilePicker | undefined {
  if (typeof window === 'undefined') return undefined;
  const picker = (window as Window & { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker;
  return typeof picker === 'function' ? picker : undefined;
}
