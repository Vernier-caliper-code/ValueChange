import { and, desc, eq } from 'drizzle-orm';

import { getDb, hasDatabase, schema } from '@/lib/db';

export type PublicArticle = Pick<
  typeof schema.articles.$inferSelect,
  'id' | 'title' | 'slug' | 'contentMd' | 'excerpt' | 'coverUrl' | 'category' | 'publishedAt'
>;

const articleColumns = {
  id: schema.articles.id,
  title: schema.articles.title,
  slug: schema.articles.slug,
  contentMd: schema.articles.contentMd,
  excerpt: schema.articles.excerpt,
  coverUrl: schema.articles.coverUrl,
  category: schema.articles.category,
  publishedAt: schema.articles.publishedAt,
} as const;

export type ArticleCategory = 'AI_FULLSTACK' | 'PERSPECTIVE';

/** 某板块已发布文章列表（按发布时间倒序）。 */
export async function getArticles(category: ArticleCategory): Promise<PublicArticle[]> {
  if (!hasDatabase()) return [];
  return getDb()
    .select(articleColumns)
    .from(schema.articles)
    .where(and(eq(schema.articles.category, category), eq(schema.articles.status, 'PUBLISHED')))
    .orderBy(desc(schema.articles.publishedAt));
}

export type PublicArticleDetail = typeof schema.articles.$inferSelect;

/** 已发布文章详情（含正文）；草稿与不存在返回 null。 */
export async function getArticleBySlug(
  slug: string,
  category: ArticleCategory,
): Promise<PublicArticleDetail | null> {
  if (!hasDatabase()) return null;
  const rows = await getDb()
    .select()
    .from(schema.articles)
    .where(
      and(
        eq(schema.articles.slug, slug),
        eq(schema.articles.category, category),
        eq(schema.articles.status, 'PUBLISHED'),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** 最新已发布文章（首页精选为空时的兜底）。 */
export async function getLatestArticles(limit: number): Promise<PublicArticle[]> {
  if (!hasDatabase()) return [];
  return getDb()
    .select(articleColumns)
    .from(schema.articles)
    .where(eq(schema.articles.status, 'PUBLISHED'))
    .orderBy(desc(schema.articles.publishedAt))
    .limit(limit);
}
