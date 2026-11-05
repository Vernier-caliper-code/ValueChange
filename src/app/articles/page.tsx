import type { Metadata } from 'next';

import { ArticleListView } from '@/components/content/article-list-view';
import { getArticles } from '@/lib/data/articles';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: 'AI 全栈',
  description: '记录一个 AI 产品从想法到上线的完整过程。聊技术，也聊选择背后的取舍。',
  path: '/articles',
});

export default async function ArticlesPage() {
  const articles = await getArticles('AI_FULLSTACK');
  return (
    <main id="main">
      <ArticleListView
        articles={articles}
        basePath="/articles"
        intro={{
          eyebrow: 'ENGINEERING / FROM ZERO TO ONE',
          title: 'AI 全栈，不止于会写代码。',
          description: '记录一个 AI 产品从想法到上线的完整过程。聊技术，也聊选择背后的取舍。',
          footnote: 'FIELD NOTES · 让每一次踩坑都有价值',
        }}
      />
    </main>
  );
}
