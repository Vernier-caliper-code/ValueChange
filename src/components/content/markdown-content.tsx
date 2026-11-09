import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import 'highlight.js/styles/github-dark.css';

const sanitizeSchema: typeof defaultSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []).filter((tag) => tag !== 'h1'), 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className'],
    iframe: ['src', 'allowfullscreen', 'frameborder', 'scrolling', 'border', 'allow'],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ['https'],
  },
};

/** iframe 只允许白名单视频平台域名。 */
const ALLOWED_IFRAME_HOSTS = ['player.bilibili.com', 'v.qq.com', 'www.youtube.com', 'www.youtube-nocookie.com'];

function isAllowedIframeSrc(src: string | undefined): boolean {
  if (!src) return false;
  try {
    const url = new URL(src);
    return ALLOWED_IFRAME_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

export function MarkdownContent({ content }: { content: string }) {
  let headingIndex = -1;
  return (
    <div className="md-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeHighlight]}
        components={{
          iframe: ({ src, ...props }) => {
            if (!isAllowedIframeSrc(src)) return <p className="text-[13px] text-muted">[不支持的视频嵌入地址]</p>;
            return (
              <span className="video-embed">
                <iframe src={src} {...props} allowFullScreen frameBorder="0" scrolling="no" />
              </span>
            );
          },
          h2: ({ children }) => {
            headingIndex += 1;
            return <h2 id={`section-${headingIndex}`}>{children}</h2>;
          },
          h3: ({ children }) => {
            headingIndex += 1;
            return <h3 id={`section-${headingIndex}`}>{children}</h3>;
          },
          img: ({ src, alt }) => {
            // 允许 https 绝对地址和站内相对路径
            if (typeof src !== 'string') return null;
            if (!src.startsWith('https://') && !src.startsWith('/')) return null;
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={src} alt={alt ?? ''} />;
          },
          a: ({ href, children }) => {
            const external = href?.startsWith('http');
            return (
              <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}