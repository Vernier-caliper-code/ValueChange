import { stripMarkdown } from './markdown-text';

const CHARS_PER_MINUTE = 400;

/** 阅读时长（分钟）：去除 Markdown 标记后按 400 字/分钟，最少 1 分钟。 */
export function getReadingTimeMinutes(contentMd: string): number {
  return Math.max(1, Math.ceil(stripMarkdown(contentMd).length / CHARS_PER_MINUTE));
}
