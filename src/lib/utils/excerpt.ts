import { stripMarkdown } from './markdown-text';

export const EXCERPT_LENGTH = 150;

/** 摘要：优先使用手动填写；留空时截取正文前 150 字。 */
export function buildExcerpt(contentMd: string, excerpt?: string | null): string {
  const manual = excerpt?.trim();
  if (manual) return manual;
  return stripMarkdown(contentMd).slice(0, EXCERPT_LENGTH);
}
