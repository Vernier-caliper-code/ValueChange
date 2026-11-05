'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, schema } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import { fail, ok, type ActionResult } from '@/lib/utils/result';

function refreshPublicPaths() {
  revalidatePath('/');
}

export async function setFeaturedAction(
  entityType: 'ARTICLE' | 'TOOL' | 'PRODUCT',
  entityId: string,
  featured: boolean,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();

  // 校验实体存在且已发布/上架
  let valid = false;
  if (entityType === 'ARTICLE') {
    const rows = await db.select().from(schema.articles).where(eq(schema.articles.id, entityId)).limit(1);
    valid = rows[0]?.status === 'PUBLISHED';
  } else if (entityType === 'TOOL') {
    const rows = await db.select().from(schema.tools).where(eq(schema.tools.id, entityId)).limit(1);
    valid = rows[0]?.status === 'PUBLISHED';
  } else {
    const rows = await db.select().from(schema.products).where(eq(schema.products.id, entityId)).limit(1);
    valid = rows[0]?.status === 'ACTIVE';
  }
  if (!valid) return fail('VALIDATION_ERROR', { message: '只能精选已发布/上架的内容' });

  if (featured) {
    const existing = await db
      .select()
      .from(schema.featuredItems)
      .where(and(eq(schema.featuredItems.entityType, entityType), eq(schema.featuredItems.entityId, entityId)))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(schema.featuredItems).values({ entityType, entityId, sortOrder: 0 });
    }
  } else {
    await db
      .delete(schema.featuredItems)
      .where(and(eq(schema.featuredItems.entityType, entityType), eq(schema.featuredItems.entityId, entityId)));
  }

  refreshPublicPaths();
  return ok();
}

export async function moveFeaturedAction(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  const rows = await db.select().from(schema.featuredItems).where(eq(schema.featuredItems.id, id)).limit(1);
  const item = rows[0];
  if (!item) return fail('NOT_FOUND');

  const delta = direction === 'up' ? -1 : 1;
  const newOrder = Math.max(0, item.sortOrder + delta);
  await db.update(schema.featuredItems).set({ sortOrder: newOrder }).where(eq(schema.featuredItems.id, id));

  refreshPublicPaths();
  return ok();
}

export async function getFeaturedItems() {
  const db = getDb();
  return db.select().from(schema.featuredItems).orderBy(schema.featuredItems.sortOrder);
}
