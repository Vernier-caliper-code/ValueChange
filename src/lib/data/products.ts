import { asc, desc, eq } from 'drizzle-orm';

import { getDb, hasDatabase, schema } from '@/lib/db';

export type PublicProduct = Pick<
  typeof schema.products.$inferSelect,
  'id' | 'name' | 'slug' | 'description' | 'status'
>;

export type ProductImage = Pick<typeof schema.productImages.$inferSelect, 'id' | 'url' | 'alt'>;

export type PublicProductDetail = PublicProduct & { images: ProductImage[] };

/** 上架商品列表（附主图）。 */
export async function getProducts(): Promise<(PublicProduct & { cover: ProductImage | null })[]> {
  if (!hasDatabase()) return [];
  const db = getDb();
  const products = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      description: schema.products.description,
      status: schema.products.status,
    })
    .from(schema.products)
    .where(eq(schema.products.status, 'ACTIVE'))
    .orderBy(desc(schema.products.createdAt));

  return Promise.all(
    products.map(async (product) => {
      const images = await db
        .select({
          id: schema.productImages.id,
          url: schema.productImages.url,
          alt: schema.productImages.alt,
        })
        .from(schema.productImages)
        .where(eq(schema.productImages.productId, product.id))
        .orderBy(asc(schema.productImages.sortOrder))
        .limit(1);
      return { ...product, cover: images[0] ?? null };
    }),
  );
}

/** 商品详情（含全部图片，按 sortOrder 排序）；下架商品也返回，由页面展示下架状态。 */
export async function getProductBySlug(slug: string): Promise<PublicProductDetail | null> {
  if (!hasDatabase()) return null;
  const db = getDb();
  const rows = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      description: schema.products.description,
      status: schema.products.status,
    })
    .from(schema.products)
    .where(eq(schema.products.slug, slug))
    .limit(1);
  const product = rows[0];
  if (!product) return null;

  const images = await db
    .select({
      id: schema.productImages.id,
      url: schema.productImages.url,
      alt: schema.productImages.alt,
    })
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, product.id))
    .orderBy(asc(schema.productImages.sortOrder));

  return { ...product, images };
}

/** 其他上架商品（已下架页的推荐）。 */
export async function getOtherActiveProducts(excludeSlug: string, limit: number): Promise<(PublicProduct & { cover: ProductImage | null })[]> {
  const all = await getProducts();
  return all.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}
