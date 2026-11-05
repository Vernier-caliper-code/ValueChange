'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { fail, ok, type ActionResult } from '@/lib/utils/result';
import { buildExcerpt } from '@/lib/utils/excerpt';
import { generateSlug, isValidSlug } from '@/lib/utils/slug';

type ArticleInput = {
  title: string;
  slug?: string;
  contentMd: string;
  excerpt?: string;
  coverUrl?: string;
  category: 'AI_FULLSTACK' | 'PERSPECTIVE';
  intent: 'draft' | 'publish';
};

function refreshPublicPaths() {
  revalidatePath('/');
  revalidatePath('/articles');
  revalidatePath('/insights');
  revalidatePath('/sitemap.xml');
}

export async function createArticleAction(input: ArticleInput): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const title = input.title.trim();
  if (!title) return fail('VALIDATION_ERROR', { message: '标题不能为空' });
  if (!input.contentMd.trim()) return fail('VALIDATION_ERROR', { message: '正文不能为空' });

  const slug = input.slug?.trim() || generateSlug('article');
  if (!isValidSlug(slug)) return fail('VALIDATION_ERROR', { message: 'slug 只能包含小写字母、数字和连字符' });

  const db = getDb();
  const existing = await db.select().from(schema.articles).where(eq(schema.articles.slug, slug)).limit(1);
  if (existing.length > 0) return fail('VALIDATION_ERROR', { message: 'slug 已存在，请修改' });

  const rows = await db
    .insert(schema.articles)
    .values({
      authorId: gate.user.id,
      title,
      slug,
      contentMd: input.contentMd,
      excerpt: buildExcerpt(input.contentMd, input.excerpt),
      coverUrl: input.coverUrl || null,
      category: input.category,
      status: input.intent === 'publish' ? 'PUBLISHED' : 'DRAFT',
      publishedAt: input.intent === 'publish' ? new Date() : null,
    })
    .returning({ id: schema.articles.id });

  refreshPublicPaths();
  return ok({ id: rows[0].id });
}

export async function updateArticleAction(input: ArticleInput & { id: string }): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  const rows = await db.select().from(schema.articles).where(eq(schema.articles.id, input.id)).limit(1);
  const article = rows[0];
  if (!article) return fail('NOT_FOUND');

  const slug = input.slug?.trim() || article.slug;
  if (!isValidSlug(slug)) return fail('VALIDATION_ERROR', { message: 'slug 只能包含小写字母、数字和连字符' });

  if (slug !== article.slug) {
    const conflict = await db.select().from(schema.articles).where(eq(schema.articles.slug, slug)).limit(1);
    if (conflict.length > 0) return fail('VALIDATION_ERROR', { message: 'slug 已存在，请修改' });
  }

  await db
    .update(schema.articles)
    .set({
      title: input.title.trim(),
      slug,
      contentMd: input.contentMd,
      excerpt: buildExcerpt(input.contentMd, input.excerpt),
      coverUrl: input.coverUrl || null,
      category: input.category,
      status: input.intent === 'publish' ? 'PUBLISHED' : 'DRAFT',
      publishedAt: input.intent === 'publish' ? article.publishedAt ?? new Date() : article.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(schema.articles.id, input.id));

  refreshPublicPaths();
  revalidatePath('/articles/' + slug);
  revalidatePath('/insights/' + slug);
  return ok();
}

export async function setArticleStatusAction(id: string, status: 'DRAFT' | 'PUBLISHED'): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  const rows = await db.select().from(schema.articles).where(eq(schema.articles.id, id)).limit(1);
  if (!rows[0]) return fail('NOT_FOUND');

  await db
    .update(schema.articles)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.articles.id, id));

  refreshPublicPaths();
  return ok();
}

export async function deleteArticleAction(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;

  const db = getDb();
  await db.delete(schema.featuredItems).where(eq(schema.featuredItems.entityId, id));
  await db.delete(schema.articles).where(eq(schema.articles.id, id));

  refreshPublicPaths();
  return ok();
}

export async function getAdminArticles() {
  const db = getDb();
  return db.select().from(schema.articles).orderBy(schema.articles.updatedAt);
}
