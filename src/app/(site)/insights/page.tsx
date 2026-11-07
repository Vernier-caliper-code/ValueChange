import type { Metadata } from 'next';

import { ArticleListView } from '@/components/content/article-list-view';
import { getArticles } from '@/lib/data/articles';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: '经验分享',
  description: '人生经验与 AI+X 经验分享：关于成长、职业，以及 AI 如何走进具体行业的真实思考。',
  path: '/insights',
});

export default async function InsightsPage() {
  const articles = await getArticles('PERSPECTIVE');
  return (
    <main id="main">
      <ArticleListView articles={articles} basePath="/insights" title="人生经验，AI+X 经验分享" />
    </main>
  );
}