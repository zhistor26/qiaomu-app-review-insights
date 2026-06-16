export type SaveReportErrorCode = 'EXPORT_FAILED' | 'USER_CANCELLED' | 'WRITE_FAILED';

export class SaveReportError extends Error {
  readonly code: SaveReportErrorCode;

  constructor(code: SaveReportErrorCode, message: string) {
    super(message);
    this.name = 'SaveReportError';
    this.code = code;
  }
}

export function isUserCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = 'name' in error ? String(error.name) : '';
  return name === 'AbortError';
}

export function mapExportHttpStatus(status: number): SaveReportError {
  if (status === 404) {
    return new SaveReportError('EXPORT_FAILED', '应用不存在或尚无分析数据');
  }
  return new SaveReportError('EXPORT_FAILED', '导出失败，请先完成分析');
}
