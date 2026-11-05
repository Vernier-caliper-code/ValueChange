/** 去除 Markdown 标记后的纯文本（用于摘要与阅读时长统计）。 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // 代码块
    .replace(/`([^`]*)`/g, '$1') // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接
    .replace(/^#{1,6}\s+/gm, '') // 标题
    .replace(/^\s*>\s?/gm, '') // 引用
    .replace(/^\s*[-*+]\s+/gm, '') // 无序列表
    .replace(/^\s*\d+\.\s+/gm, '') // 有序列表
    .replace(/^\s*[-*_]{3,}\s*$/gm, ' ') // 分隔线
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1') // 强调
    .replace(/<[^>]+>/g, ' ') // HTML 标签
    .replace(/\s+/g, ' ')
    .trim();
}

export type Heading = { depth: 2 | 3; text: string };

/** 提取 H2/H3 作为文章目录；忽略代码块内的内容。 */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      headings.push({ depth: 2, text: h2[1] });
      continue;
    }
    const h3 = /^###\s+(.+?)\s*$/.exec(line);
    if (h3) headings.push({ depth: 3, text: h3[1] });
  }
  return headings;
}
