import { and, asc, eq } from 'drizzle-orm';

import { getDb, hasDatabase, schema } from '@/lib/db';
import { getLatestArticles, type PublicArticle } from './articles';

export type FeaturedCard = {
  entityType: 'ARTICLE' | 'TOOL' | 'PRODUCT';
  title: string;
  description: string;
  href: string;
  imageUrl: string | null;
  date: Date | null;
};

async function resolveFeatured(): Promise<FeaturedCard[]> {
  const db = getDb();
  const items = await db
    .select()
    .from(schema.featuredItems)
    .orderBy(asc(schema.featuredItems.sortOrder));

  const cards: FeaturedCard[] = [];
  for (const item of items) {
    if (item.entityType === 'ARTICLE') {
      const rows = await db
        .select()
        .from(schema.articles)
        .where(and(eq(schema.articles.id, item.entityId), eq(schema.articles.status, 'PUBLISHED')))
        .limit(1);
      const article = rows[0];
      if (article) {
        cards.push({
          entityType: 'ARTICLE',
          title: article.title,
          description: article.excerpt ?? '',
          href: `${article.category === 'AI_FULLSTACK' ? '/articles' : '/insights'}/${article.slug}`,
          imageUrl: article.coverUrl,
          date: article.publishedAt,
        });
      }
    } else if (item.entityType === 'TOOL') {
      const rows = await db
        .select()
        .from(schema.tools)
        .where(and(eq(schema.tools.id, item.entityId), eq(schema.tools.status, 'PUBLISHED')))
        .limit(1);
      const tool = rows[0];
      if (tool) {
        cards.push({
          entityType: 'TOOL',
          title: tool.name,
          description: tool.summary,
          href: `/tools/${tool.slug}`,
          imageUrl: tool.imageUrl,
          date: null,
        });
      }
    } else {
      const rows = await db
        .select()
        .from(schema.products)
        .where(and(eq(schema.products.id, item.entityId), eq(schema.products.status, 'ACTIVE')))
        .limit(1);
      const product = rows[0];
      if (product) {
        const images = await db
          .select({ url: schema.productImages.url })
          .from(schema.productImages)
          .where(eq(schema.productImages.productId, product.id))
          .orderBy(asc(schema.productImages.sortOrder))
          .limit(1);
        cards.push({
          entityType: 'PRODUCT',
          title: product.name,
          description: product.description,
          href: `/products/${product.slug}`,
          imageUrl: images[0]?.url ?? null,
          date: null,
        });
      }
    }
  }
  return cards;
}

export type HomeData = {
  /** 精选前 4 条；无精选时为最新 4 篇文章。 */
  featured: FeaturedCard[];
};

export async function getHomeData(): Promise<HomeData> {
  if (!hasDatabase()) return { featured: [] };
  const featured = (await resolveFeatured()).slice(0, 4);
  if (featured.length > 0) return { featured };

  const latest = await getLatestArticles(4);
  return {
    featured: latest.map(articleToCard),
  };
}

function articleToCard(article: PublicArticle): FeaturedCard {
  return {
    entityType: 'ARTICLE',
    title: article.title,
    description: article.excerpt ?? '',
    href: `${article.category === 'AI_FULLSTACK' ? '/articles' : '/insights'}/${article.slug}`,
    imageUrl: article.coverUrl,
    date: article.publishedAt,
  };
}
