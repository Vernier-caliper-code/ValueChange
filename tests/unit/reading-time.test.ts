import { describe, expect, it } from 'vitest';

import { getReadingTimeMinutes } from '@/lib/utils/reading-time';

describe('getReadingTimeMinutes', () => {
  it('不足 400 字按 1 分钟', () => {
    expect(getReadingTimeMinutes('短文')).toBe(1);
    expect(getReadingTimeMinutes('字'.repeat(400))).toBe(1);
  });
  it('401 字进位为 2 分钟', () => {
    expect(getReadingTimeMinutes('字'.repeat(401))).toBe(2);
  });
  it('统计前去除 Markdown 标记', () => {
    expect(getReadingTimeMinutes('## ' + '字'.repeat(398))).toBe(1);
  });
});
