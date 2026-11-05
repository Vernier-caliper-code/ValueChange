'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { fail, ok, type ActionResult } from '@/lib/utils/result';
import { generateSlug, isValidSlug } from '@/lib/utils/slug';

type ToolInput = {
  name: string;
  slug?: string;
  summary: string;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  intent: 'draft' | 'publish';
};

function refreshPublicPaths() {
  revalidatePath('/');
  revalidatePath('/tools');
  revalidatePath('/sitemap.xml');
}

export async function createToolAction(input: ToolInput): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  if (!input.name.trim()) return fail('VALIDATION_ERROR', { message: '工具名称不能为空' });
  if (!input.summary.trim()) return fail('VALIDATION_ERROR', { message: '功能摘要不能为空' });
  if (!input.imageUrl.trim()) return fail('VALIDATION_ERROR', { message: '请上传工具图片' });
  if (!input.websiteUrl.startsWith('http://') && !input.websiteUrl.startsWith('https://')) {
    return fail('VALIDATION_ERROR', { message: '官网链接必须以 http:// 或 https:// 开头' });
  }

  const slug = input.slug?.trim() || generateSlug('tool');
  if (!isValidSlug(slug)) return fail('VALIDATION_ERROR', { message: 'slug 只能包含小写字母、数字和连字符' });

  const db = getDb();
  const existing = await db.select().from(schema.tools).where(eq(schema.tools.slug, slug)).limit(1);
  if (existing.length > 0) return fail('VALIDATION_ERROR', { message: 'slug 已存在，请修改' });

  const rows = await db
    .insert(schema.tools)
    .values({
      authorId: gate.user.id,
      name: input.name.trim(),
      slug,
      summary: input.summary.trim(),
      description: input.description,
      imageUrl: input.imageUrl.trim(),
      websiteUrl: input.websiteUrl.trim(),
      status: input.intent === 'publish' ? 'PUBLISHED' : 'DRAFT',
    })
    .returning({ id: schema.tools.id });

  refreshPublicPaths();
  return ok({ id: rows[0].id });
}

export async function updateToolAction(input: ToolInput & { id: string }): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  const rows = await db.select().from(schema.tools).where(eq(schema.tools.id, input.id)).limit(1);
  const tool = rows[0];
  if (!tool) return fail('NOT_FOUND');

  const slug = input.slug?.trim() || tool.slug;
  if (!isValidSlug(slug)) return fail('VALIDATION_ERROR', { message: 'slug 只能包含小写字母、数字和连字符' });

  if (slug !== tool.slug) {
    const conflict = await db.select().from(schema.tools).where(eq(schema.tools.slug, slug)).limit(1);
    if (conflict.length > 0) return fail('VALIDATION_ERROR', { message: 'slug 已存在，请修改' });
  }

  await db
    .update(schema.tools)
    .set({
      name: input.name.trim(),
      slug,
      summary: input.summary.trim(),
      description: input.description,
      imageUrl: input.imageUrl.trim(),
      websiteUrl: input.websiteUrl.trim(),
      status: input.intent === 'publish' ? 'PUBLISHED' : 'DRAFT',
      updatedAt: new Date(),
    })
    .where(eq(schema.tools.id, input.id));

  refreshPublicPaths();
  revalidatePath('/tools/' + slug);
  return ok();
}

export async function setToolStatusAction(id: string, status: 'DRAFT' | 'PUBLISHED'): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  await db.update(schema.tools).set({ status, updatedAt: new Date() }).where(eq(schema.tools.id, id));

  refreshPublicPaths();
  return ok();
}

export async function deleteToolAction(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  await db.delete(schema.featuredItems).where(eq(schema.featuredItems.entityId, id));
  await db.delete(schema.tools).where(eq(schema.tools.id, id));

  refreshPublicPaths();
  return ok();
}

export async function getAdminTools() {
  const db = getDb();
  return db.select().from(schema.tools).orderBy(schema.tools.updatedAt);
}
