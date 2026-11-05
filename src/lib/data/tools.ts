import { desc, eq } from 'drizzle-orm';

import { getDb, hasDatabase, schema } from '@/lib/db';

export type PublicTool = Pick<
  typeof schema.tools.$inferSelect,
  'id' | 'name' | 'slug' | 'summary' | 'imageUrl'
>;

const toolColumns = {
  id: schema.tools.id,
  name: schema.tools.name,
  slug: schema.tools.slug,
  summary: schema.tools.summary,
  imageUrl: schema.tools.imageUrl,
} as const;

/** 已发布工具列表（按创建时间倒序）。 */
export async function getTools(): Promise<PublicTool[]> {
  if (!hasDatabase()) return [];
  return getDb()
    .select(toolColumns)
    .from(schema.tools)
    .where(eq(schema.tools.status, 'PUBLISHED'))
    .orderBy(desc(schema.tools.createdAt));
}

export type PublicToolDetail = typeof schema.tools.$inferSelect;

export async function getToolBySlug(slug: string): Promise<PublicToolDetail | null> {
  if (!hasDatabase()) return null;
  const rows = await getDb()
    .select()
    .from(schema.tools)
    .where(eq(schema.tools.slug, slug))
    .limit(1);
  const tool = rows[0];
  return tool && tool.status === 'PUBLISHED' ? tool : null;
}

/** 首页深色工具区：最新发布的若干工具。 */
export async function getLatestTools(limit: number): Promise<PublicTool[]> {
  if (!hasDatabase()) return [];
  return getDb()
    .select(toolColumns)
    .from(schema.tools)
    .where(eq(schema.tools.status, 'PUBLISHED'))
    .orderBy(desc(schema.tools.createdAt))
    .limit(limit);
}
