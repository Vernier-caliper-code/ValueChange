import Link from 'next/link';

import { ArticleToc } from '@/components/content/article-toc';
import { Breadcrumb } from '@/components/content/breadcrumb';
import { MarkdownContent } from '@/components/content/markdown-content';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { DEFAULT_ARTICLE_COVER } from '@/lib/data/constants';
import type { PublicArticleDetail } from '@/lib/data/articles';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import { formatDate } from '@/lib/utils/date';
import { buildExcerpt } from '@/lib/utils/excerpt';
import { extractHeadings } from '@/lib/utils/markdown-text';
import { getReadingTimeMinutes } from '@/lib/utils/reading-time';

export function ArticleDetailView({
  article,
  basePath,
  categoryLabel,
}: {
  article: PublicArticleDetail;
  basePath: '/articles' | '/insights';
  categoryLabel: 'AI 全栈' | '经验分享';
}) {
  const headings = extractHeadings(article.contentMd);
  const excerpt = buildExcerpt(article.contentMd, article.excerpt);
  const readingTime = getReadingTimeMinutes(article.contentMd);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: excerpt,
          image: article.coverUrl ?? `${SITE_URL}${DEFAULT_ARTICLE_COVER}`,
          datePublished: article.publishedAt?.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          author: { '@type': 'Person', name: SITE_NAME },
          publisher: { '@type': 'Organization', name: SITE_NAME },
          mainEntityOfPage: `${SITE_URL}${basePath}/${article.slug}`,
        }}
      />
      <section className="border-b border-line">
        <Container className="pb-10 pt-[53px]">
          <Breadcrumb
            items={[
              { label: '首页', href: '/' },
              { label: categoryLabel, href: basePath },
              { label: article.title },
            ]}
          />
          <h1 className="max-w-[800px] text-[28px] font-bold leading-[1.5] tracking-[-1.2px] lg:text-[39px]">
            {article.title}
          </h1>
          <p className="mt-4 max-w-[650px] text-[15px] leading-[1.9] text-muted">{excerpt}</p>
          <div className="mt-6 flex items-center gap-3.5 text-[11px] text-[#929ba9]">
            <span>{article.publishedAt ? formatDate(article.publishedAt) : ''}</span>
            <span>·</span>
            <span>{readingTime} 分钟阅读</span>
          </div>
        </Container>
      </section>
      <Container className="grid grid-cols-1 gap-14 pb-[75px] pt-[43px] lg:grid-cols-[minmax(0,760px)_230px] lg:justify-between">
        <article>
          <MarkdownContent content={article.contentMd} />
          <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
            <Link href={basePath} className="text-[13px] font-semibold text-brand hover:underline hover:underline-offset-4">
              ← 返回{categoryLabel}
            </Link>
            <Link
              href="/about#contact"
              className="text-[13px] font-semibold text-brand hover:underline hover:underline-offset-4"
            >
              和我聊聊 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
        {headings.length > 0 ? (
          <aside aria-label="文章目录" className="hidden lg:block">
            <div className="sticky top-8">
              <h2 className="mb-3 text-[13px] font-semibold">本文目录</h2>
              <ArticleToc headings={headings} />
              <p className="mt-6 border-t border-line pt-4 text-[11px] leading-[1.9] text-muted">
                希望这篇内容对你有帮助。
                <br />
                <Link href="/about#contact" className="mt-2 inline-block font-semibold text-brand">
                  和我聊聊 →
                </Link>
              </p>
            </div>
          </aside>
        ) : null}
      </Container>
    </>
  );
}
