import { notFound } from 'next/navigation';

import { ToolEditor } from '@/components/forms/tool-editor';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const rows = await db.select().from(schema.tools).where(eq(schema.tools.id, id)).limit(1);
  const tool = rows[0];
  if (!tool) notFound();

  return (
    <div>
      <h2 className="mb-6 text-[20px] font-bold">编辑工具</h2>
      <ToolEditor
        tool={{
          id: tool.id,
          name: tool.name,
          slug: tool.slug,
          summary: tool.summary,
          description: tool.description,
          imageUrl: tool.imageUrl,
          websiteUrl: tool.websiteUrl,
          status: tool.status,
        }}
      />
    </div>
  );
}
