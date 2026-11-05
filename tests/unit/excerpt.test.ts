import { describe, expect, it } from 'vitest';

import { EXCERPT_LENGTH, buildExcerpt } from '@/lib/utils/excerpt';

describe('buildExcerpt', () => {
  it('手动摘要优先且去除首尾空白', () => {
    expect(buildExcerpt('正文', '  手动摘要  ')).toBe('手动摘要');
  });
  it('留空时截取正文前 150 字（去除 Markdown 标记）', () => {
    const md = '## 标题\n' + '字'.repeat(200);
    const excerpt = buildExcerpt(md, null);
    expect(excerpt.startsWith('标题')).toBe(true);
    expect(excerpt.length).toBe(EXCERPT_LENGTH);
  });
  it('空字符串摘要视为未填写', () => {
    expect(buildExcerpt('正文内容', '')).toBe('正文内容');
  });
});
