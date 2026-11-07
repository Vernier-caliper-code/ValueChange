import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumb } from '@/components/content/breadcrumb';
import { ProductCard } from '@/components/content/product-card';
import { ProductGallery } from '@/components/content/product-gallery';
import { WechatConsultButton } from '@/components/content/wechat-dialog';
import { Container } from '@/components/ui/container';
import { getOtherActiveProducts, getProductBySlug, getProducts } from '@/lib/data/products';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: '商品不存在' };
  return buildMetadata({
    title: product.name,
    description: product.description.slice(0, 150),
    path: `/products/${product.slug}`,
    imageUrl: product.images[0]?.url ?? null,
    noIndex: product.status !== 'ACTIVE',
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  if (product.status === 'OFF_SHELF') {
    const others = await getOtherActiveProducts(product.slug, 3);
    return (
      <main id="main">
        <Container className="py-16">
          <Breadcrumb
            items={[
              { label: '首页', href: '/' },
              { label: '我的商品', href: '/products' },
              { label: product.name },
            ]}
          />
          <div className="rounded-lg border border-dashed border-line bg-white px-8 py-14 text-center">
            <strong className="text-[18px] font-semibold">该商品已下架</strong>
            <p className="mt-3 text-[13px] text-muted">「{product.name}」暂时不再提供。看看其他还在架上的作品吧。</p>
            <Link href="/products" className="mt-5 inline-block text-[13px] font-semibold text-brand hover:underline">
              浏览其他商品 →
            </Link>
          </div>
          {others.length > 0 ? (
            <section aria-label="其他商品" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </section>
          ) : null}
        </Container>
      </main>
    );
  }

  return (
    <main id="main">
      <Container className="pt-[34px]">
        <Breadcrumb
          items={[
            { label: '首页', href: '/' },
            { label: '我的商品', href: '/products' },
            { label: product.name },
          ]}
        />
      </Container>
      <Container className="grid grid-cols-1 gap-12 pb-16 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />
        <div>
          <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[1.8px] text-brand before:block before:h-px before:w-[22px] before:bg-current">
            MADE BY VALUEPASS
          </p>
          <h1 className="mt-4 text-[28px] font-bold leading-[1.4] lg:text-[36px]">{product.name}</h1>
          <p className="mt-4 whitespace-pre-line text-[14px] leading-[2] text-muted">{product.description}</p>
          <hr className="my-7 border-line" />
          <WechatConsultButton productSlug={product.slug} />
        </div>
      </Container>
    </main>
  );
}
