import { describe, expect, it } from 'vitest';

import { formatDate } from '@/lib/utils/date';

describe('formatDate', () => {
  it('输出 YYYY.MM.DD', () => {
    expect(formatDate(new Date('2026-11-05T02:00:00Z'))).toBe('2026.11.05');
  });
  it('按 Asia/Shanghai 换算日期边界', () => {
    // UTC 2026-11-04 20:00 = 北京时间 2026-11-05 04:00
    expect(formatDate(new Date('2026-11-04T20:00:00Z'))).toBe('2026.11.05');
  });
});
