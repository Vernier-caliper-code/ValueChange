import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MarkdownContent } from '@/components/content/markdown-content';

function render(content: string): string {
  return renderToStaticMarkup(<MarkdownContent content={content} />);
}

describe('MarkdownContent 插图与视频', () => {
  it('站内图片相对路径可渲染', () => {
    const html = render('![测试图](/images/product-hero.png)');
    expect(html).toContain('/images/product-hero.png');
    expect(html).toContain('<img');
  });

  it('Bilibili iframe 白名单通过', () => {
    const html = render('<iframe src="https://player.bilibili.com/player.html?bvid=BV1xx" allowfullscreen></iframe>');
    expect(html).toContain('player.bilibili.com');
    expect(html).toContain('video-embed');
  });

  it('非白名单 iframe 被拦截并提示', () => {
    const html = render('<iframe src="https://evil.com/embed"></iframe>');
    expect(html).not.toContain('evil.com');
    expect(html).toContain('不支持的视频嵌入地址');
  });

  it('YouTube 白名单通过', () => {
    const html = render('<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>');
    expect(html).toContain('www.youtube.com');
  });
});