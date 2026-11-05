'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { fail, ok, type ActionResult } from '@/lib/utils/result';
import { generateSlug, isValidSlug } from '@/lib/utils/slug';

type ProductImageInput = { url: string; alt?: string; sortOrder: number };

type ProductInput = {
  name: string;
  slug?: string;
  description: string;
  images: ProductImageInput[];
  intent: 'draft' | 'publish';
};

function refreshPublicPaths() {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/sitemap.xml');
}

export async function createProductAction(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  if (!input.name.trim()) return fail('VALIDATION_ERROR', { message: '商品名称不能为空' });
  if (!input.description.trim()) return fail('VALIDATION_ERROR', { message: '商品描述不能为空' });
  if (input.images.length === 0) return fail('VALIDATION_ERROR', { message: '商品至少需要一张图片' });

  const slug = input.slug?.trim() || generateSlug('product');
  if (!isValidSlug(slug)) return fail('VALIDATION_ERROR', { message: 'slug 只能包含小写字母、数字和连字符' });

  const db = getDb();
  const existing = await db.select().from(schema.products).where(eq(schema.products.slug, slug)).limit(1);
  if (existing.length > 0) return fail('VALIDATION_ERROR', { message: 'slug 已存在，请修改' });

  const productRows = await db
    .insert(schema.products)
    .values({
      authorId: gate.user.id,
      name: input.name.trim(),
      slug,
      description: input.description,
      status: input.intent === 'publish' ? 'ACTIVE' : 'OFF_SHELF',
    })
    .returning({ id: schema.products.id });

  const productId = productRows[0].id;
  for (const image of input.images) {
    await db.insert(schema.productImages).values({
      productId,
      url: image.url,
      alt: image.alt || null,
      sortOrder: image.sortOrder,
    });
  }

  refreshPublicPaths();
  return ok({ id: productId });
}

export async function updateProductAction(input: ProductInput & { id: string }): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  const rows = await db.select().from(schema.products).where(eq(schema.products.id, input.id)).limit(1);
  const product = rows[0];
  if (!product) return fail('NOT_FOUND');

  const slug = input.slug?.trim() || product.slug;
  if (!isValidSlug(slug)) return fail('VALIDATION_ERROR', { message: 'slug 只能包含小写字母、数字和连字符' });

  if (slug !== product.slug) {
    const conflict = await db.select().from(schema.products).where(eq(schema.products.slug, slug)).limit(1);
    if (conflict.length > 0) return fail('VALIDATION_ERROR', { message: 'slug 已存在，请修改' });
  }

  await db
    .update(schema.products)
    .set({
      name: input.name.trim(),
      slug,
      description: input.description,
      status: input.intent === 'publish' ? 'ACTIVE' : 'OFF_SHELF',
      updatedAt: new Date(),
    })
    .where(eq(schema.products.id, input.id));

  // 重建图片：先删后插（v1 简化，后续可优化为增量）
  await db.delete(schema.productImages).where(eq(schema.productImages.productId, input.id));
  for (const image of input.images) {
    await db.insert(schema.productImages).values({
      productId: input.id,
      url: image.url,
      alt: image.alt || null,
      sortOrder: image.sortOrder,
    });
  }

  refreshPublicPaths();
  revalidatePath('/products/' + slug);
  return ok();
}

export async function setProductStatusAction(id: string, status: 'ACTIVE' | 'OFF_SHELF'): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  await db.update(schema.products).set({ status, updatedAt: new Date() }).where(eq(schema.products.id, id));

  refreshPublicPaths();
  return ok();
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  await db.delete(schema.featuredItems).where(eq(schema.featuredItems.entityId, id));
  await db.delete(schema.products).where(eq(schema.products.id, id));

  refreshPublicPaths();
  return ok();
}

export async function getAdminProducts() {
  const db = getDb();
  const products = await db.select().from(schema.products).orderBy(schema.products.updatedAt);
  const result = [];
  for (const product of products) {
    const images = await db.select().from(schema.productImages).where(eq(schema.productImages.productId, product.id)).orderBy(schema.productImages.sortOrder);
    result.push({ ...product, images });
  }
  return result;
}
