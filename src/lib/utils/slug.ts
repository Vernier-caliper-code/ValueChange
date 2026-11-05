import { randomBytes } from 'node:crypto';

export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function isValidSlug(value: string): boolean {
  return value.length > 0 && value.length <= 160 && SLUG_PATTERN.test(value);
}

/** 生成 `${prefix}-{8 位随机串}` 形式的 slug。 */
export function generateSlug(prefix: 'article' | 'tool' | 'product'): string {
  return `${prefix}-${randomBytes(4).toString('hex')}`;
}
