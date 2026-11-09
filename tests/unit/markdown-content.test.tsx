import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MarkdownContent } from '@/components/content/markdown-content';

function render(content: string): string {
  return renderToStaticMarkup(<MarkdownContent content={content} />);
}

describe('MarkdownContent 清洗规则', () => {
  it('渲染标题、加粗、链接等常规语法', () => {
    const html = render('## 你好\n这是 **重点** 和 [官网](https://example.com)。');
    expect(html).toContain('<h2 id="section-0">你好</h2>');
    expect(html).toContain('<strong>重点</strong>');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it('H1 不渲染（页面标题单独渲染）', () => {
    expect(render('# 一级标题')).not.toContain('<h1');
  });
  it('原始 HTML 与脚本被禁用', () => {
    const html = render('<script>alert(1)</script>\n<div onclick="x()">内容</div>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onclick');
  });
  it('javascript: 链接被移除协议', () => {
    const html = render('[点我](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });
  it('图片允许 https 和站内相对路径，http 被剥除', () => {
    const html = render('![ok](https://cdn.com/a.png)\n![local](/images/local.png)\n![bad](http://evil.com/b.png)');
    expect(html).toContain('https://cdn.com/a.png');
    expect(html).toContain('/images/local.png');
    expect(html).not.toContain('http://evil.com');
  });
  it('代码块保留 language className 供高亮', () => {
    const html = render('\`\`\`ts\nconst a = 1;\n\`\`\`');
    expect(html).toContain('language-ts');
  });
  it('站内相对链接不开新窗口', () => {
    const html = render('[站内](/articles)');
    expect(html).toContain('href="/articles"');
    expect(html).not.toContain('target="_blank"');
  });
  it('iframe 仅允许白名单视频平台域名', () => {
    const allowed = render('<iframe src="https://player.bilibili.com/player.html?bvid=BV1xx"></iframe>');
    expect(allowed).toContain('player.bilibili.com');
    const blocked = render('<iframe src="https://evil.com/embed"></iframe>');
    expect(blocked).not.toContain('evil.com');
    expect(blocked).toContain('[不支持的视频嵌入地址]');
  });
});
