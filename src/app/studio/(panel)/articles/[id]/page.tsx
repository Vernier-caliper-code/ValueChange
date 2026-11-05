import { notFound } from 'next/navigation';

import { ArticleEditor } from '@/components/forms/article-editor';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const rows = await db.select().from(schema.articles).where(eq(schema.articles.id, id)).limit(1);
  const article = rows[0];
  if (!article) notFound();

  return (
    <div>
      <h2 className="mb-6 text-[20px] font-bold">编辑文章</h2>
      <ArticleEditor
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          contentMd: article.contentMd,
          excerpt: article.excerpt ?? '',
          coverUrl: article.coverUrl ?? '',
          category: article.category,
          status: article.status,
        }}
      />
    </div>
  );
}
