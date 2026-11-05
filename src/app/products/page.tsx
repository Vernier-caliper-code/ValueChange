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
  description: '一些沉淀经验的数字笔记、工作流模板与服务。仅作展示，不提供在线支付。',
  path: '/products',
});

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <main id="main">
      <PageIntro
        eyebrow="SMALL CREATIONS / REAL VALUE"
        title={<>认真做的小作品，<br />分享给需要的人。</>}
        description="一些沉淀经验的数字笔记、工作流模板与服务。希望它们能为你节省一点时间，或带来一个新的思路。"
        footnote="MADE BY VALUEPASS · 展示而非在线售卖"
      />
      <Container className="pb-6 pt-10">
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
      <Container className="pb-[75px]">
        <p className="rounded-lg border border-line bg-white px-6 py-4 text-[12px] leading-[1.9] text-muted">
          <strong className="text-ink">关于商品</strong>　本页面仅用于展示个人商品与服务，不提供在线支付、购物车或订单功能。如果你对某件作品感兴趣，可以进入详情页，通过微信与我进一步沟通。
        </p>
      </Container>
    </main>
  );
}
