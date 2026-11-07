import type { Metadata } from 'next';

import { PageIntro } from '@/components/content/page-intro';
import { ProductCard } from '@/components/content/product-card';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { getProducts } from '@/lib/data/products';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: '我的商品',
  description: '实用的产品带来更高的价值：沉淀经验的数字笔记、工作流模板与服务。',
  path: '/products',
});

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <main id="main">
      <PageIntro title="实用的产品带来更高的价值" />
      <Container className="pb-[75px] pt-10">
        {products.length > 0 ? (
          <section aria-label="商品列表" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          <EmptyState
            title="内容筹备中"
            description="小作品正在打磨中。先去看看其他板块的内容吧。"
            actionHref="/"
            actionLabel="回到首页"
          />
        )}
      </Container>
    </main>
  );
}
