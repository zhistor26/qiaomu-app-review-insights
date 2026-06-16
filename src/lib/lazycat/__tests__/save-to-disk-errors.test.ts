import { describe, it, expect } from 'vitest';
import { isUserCancelled, mapExportHttpStatus } from '../save-to-disk-errors';

describe('save-to-disk-errors', () => {
  it('UT-004/005: mapExportHttpStatus', () => {
    expect(mapExportHttpStatus(404).code).toBe('EXPORT_FAILED');
    expect(mapExportHttpStatus(500).code).toBe('EXPORT_FAILED');
  });

  it('UT-006: AbortError → USER_CANCELLED 判定', () => {
    expect(isUserCancelled({ name: 'AbortError' })).toBe(true);
    expect(isUserCancelled(new Error('fail'))).toBe(false);
  });
});
