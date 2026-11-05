import { notFound } from 'next/navigation';

import { ProductEditor } from '@/components/forms/product-editor';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const rows = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  const product = rows[0];
  if (!product) notFound();

  const images = await db.select().from(schema.productImages).where(eq(schema.productImages.productId, id)).orderBy(schema.productImages.sortOrder);

  return (
    <div>
      <h2 className="mb-6 text-[20px] font-bold">编辑商品</h2>
      <ProductEditor
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          images: images.map((img) => ({ url: img.url, alt: img.alt ?? '', sortOrder: img.sortOrder })),
          status: product.status,
        }}
      />
    </div>
  );
}
