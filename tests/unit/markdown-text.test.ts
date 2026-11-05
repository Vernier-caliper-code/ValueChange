import { describe, expect, it } from 'vitest';

import { extractHeadings, stripMarkdown } from '@/lib/utils/markdown-text';

describe('stripMarkdown', () => {
  it('去除标题、强调、链接与代码标记', () => {
    const md = '## 标题\n这是 **加粗** 与 [链接](https://a.com)，还有 `code`。';
    expect(stripMarkdown(md)).toBe('标题 这是 加粗 与 链接，还有 code。');
  });
  it('代码块整体不计入', () => {
    const md = '前文。\n\`\`\`ts\nconst a = 1;\n\`\`\`\n后文。';
    expect(stripMarkdown(md)).toBe('前文。 后文。');
  });
  it('图片被移除，列表与引用保留文字', () => {
    const md = '> 引用内容\n- 第一项\n![图](https://a.com/x.png)';
    expect(stripMarkdown(md)).toBe('引用内容 第一项');
  });
});

describe('extractHeadings', () => {
  it('按顺序提取 H2/H3', () => {
    const md = '# 忽略H1\n## 第一节\n### 小节 1.1\n正文\n## 第二节';
    expect(extractHeadings(md)).toEqual([
      { depth: 2, text: '第一节' },
      { depth: 3, text: '小节 1.1' },
      { depth: 2, text: '第二节' },
    ]);
  });
  it('忽略代码块中的 # 行', () => {
    const md = '## 真标题\n\`\`\`\n## 假标题\n\`\`\`';
    expect(extractHeadings(md)).toEqual([{ depth: 2, text: '真标题' }]);
  });
  it('无标题时返回空数组', () => {
    expect(extractHeadings('只有正文。')).toEqual([]);
  });
});
