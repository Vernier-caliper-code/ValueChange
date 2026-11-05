import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleDetailView } from '@/components/content/article-detail-view';
import { getArticleBySlug, getArticles } from '@/lib/data/articles';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { DEFAULT_ARTICLE_COVER } from '@/lib/data/constants';
import { buildExcerpt } from '@/lib/utils/excerpt';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getArticles('PERSPECTIVE');
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, 'PERSPECTIVE');
  if (!article) return { title: '文章不存在' };
  return buildMetadata({
    title: article.title,
    description: buildExcerpt(article.contentMd, article.excerpt),
    path: `/insights/${article.slug}`,
    imageUrl: article.coverUrl ?? `${SITE_URL}${DEFAULT_ARTICLE_COVER}`,
  });
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, 'PERSPECTIVE');
  if (!article) notFound();
  return (
    <main id="main">
      <ArticleDetailView article={article} basePath="/insights" categoryLabel="经验分享" />
    </main>
  );
}
