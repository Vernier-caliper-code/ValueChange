import type { Metadata } from 'next';

import { ArticleListView } from '@/components/content/article-list-view';
import { getArticles } from '@/lib/data/articles';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: 'AI 全栈',
  description: '软件工程师的 AI 全栈实战分享：从想法到上线的完整记录，聊技术选型，也聊踩坑复盘。',
  path: '/articles',
});

export default async function ArticlesPage() {
  const articles = await getArticles('AI_FULLSTACK');
  return (
    <main id="main">
      <ArticleListView articles={articles} basePath="/articles" title="软件工程师的实战分享" />
    </main>
  );
}