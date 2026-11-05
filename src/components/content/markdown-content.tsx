import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import 'highlight.js/styles/github-dark.css';

const sanitizeSchema: typeof defaultSchema = {
  ...defaultSchema,
  tagNames: (defaultSchema.tagNames ?? []).filter((tag) => tag !== 'h1'),
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className'],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ['https'],
  },
};

export function MarkdownContent({ content }: { content: string }) {
  let headingIndex = -1;
  return (
    <div className="md-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypeHighlight]}
        components={{
          h2: ({ children }) => {
            headingIndex += 1;
            return <h2 id={`section-${headingIndex}`}>{children}</h2>;
          },
          h3: ({ children }) => {
            headingIndex += 1;
            return <h3 id={`section-${headingIndex}`}>{children}</h3>;
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
