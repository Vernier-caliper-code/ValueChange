import { describe, expect, it } from 'vitest';

import { generateSlug, isValidSlug } from '@/lib/utils/slug';

describe('isValidSlug', () => {
  it('接受小写字母、数字与连字符', () => {
    expect(isValidSlug('my-first-post-01')).toBe(true);
  });
  it('拒绝大写、下划线、空格与中文', () => {
    for (const bad of ['MyPost', 'my_post', 'my post', '中文', '']) {
      expect(isValidSlug(bad)).toBe(false);
    }
  });
  it('拒绝超过 160 字符', () => {
    expect(isValidSlug('a'.repeat(161))).toBe(false);
  });
});

describe('generateSlug', () => {
  it('生成 `前缀-8位随机串` 且每次不同', () => {
    const a = generateSlug('article');
    const b = generateSlug('article');
    expect(a).toMatch(/^article-[0-9a-f]{8}$/);
    expect(a).not.toBe(b);
    expect(isValidSlug(a)).toBe(true);
    expect(generateSlug('tool')).toMatch(/^tool-/);
    expect(generateSlug('product')).toMatch(/^product-/);
  });
});
