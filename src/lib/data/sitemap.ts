import { eq } from 'drizzle-orm';

import { getDb, hasDatabase, schema } from '@/lib/db';

export type SitemapEntry = { path: string; updatedAt: Date };

/** 已发布文章、已发布工具、上架商品的详情页路径。 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  if (!hasDatabase()) return [];
  const db = getDb();

  const [articleRows, toolRows, productRows] = await Promise.all([
    db
      .select({
        slug: schema.articles.slug,
        category: schema.articles.category,
        updatedAt: schema.articles.updatedAt,
      })
      .from(schema.articles)
      .where(eq(schema.articles.status, 'PUBLISHED')),
    db
      .select({ slug: schema.tools.slug, updatedAt: schema.tools.updatedAt })
      .from(schema.tools)
      .where(eq(schema.tools.status, 'PUBLISHED')),
    db
      .select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt })
      .from(schema.products)
      .where(eq(schema.products.status, 'ACTIVE')),
  ]);

  return [
    ...articleRows.map((r) => ({
      path: `${r.category === 'AI_FULLSTACK' ? '/articles' : '/insights'}/${r.slug}`,
      updatedAt: r.updatedAt,
    })),
    ...toolRows.map((r) => ({ path: `/tools/${r.slug}`, updatedAt: r.updatedAt })),
    ...productRows.map((r) => ({ path: `/products/${r.slug}`, updatedAt: r.updatedAt })),
  ];
}
