import type { Metadata } from 'next';

import { ArticleListView } from '@/components/content/article-list-view';
import { getArticles } from '@/lib/data/articles';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: '经验分享',
  description: '关于成长、职业和 AI+X 的思考。技术是手段，生活才是答案。',
  path: '/insights',
});

export default async function InsightsPage() {
  const articles = await getArticles('PERSPECTIVE');
  return (
    <main id="main">
      <ArticleListView
        articles={articles}
        basePath="/insights"
        intro={{
          eyebrow: 'PERSPECTIVE / LIFE & AI+X',
          title: '技术之外，也认真生活。',
          description: '关于成长、职业与 AI 进入其他行业的真实思考。',
          footnote: 'PERSPECTIVES · 技术是手段，生活才是答案',
        }}
      />
    </main>
  );
}
