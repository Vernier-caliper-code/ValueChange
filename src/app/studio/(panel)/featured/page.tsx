import { getAdminArticles } from '@/lib/actions/articles';
import { getAdminTools } from '@/lib/actions/tools';
import { getAdminProducts } from '@/lib/actions/products';
import { getFeaturedItems } from '@/lib/actions/featured';
import { FeaturedManager } from '@/components/forms/featured-manager';

export default async function StudioFeaturedPage() {
  const [articles, tools, products, featured] = await Promise.all([
    getAdminArticles(),
    getAdminTools(),
    getAdminProducts(),
    getFeaturedItems(),
  ]);

  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED');
  const publishedTools = tools.filter((t) => t.status === 'PUBLISHED');
  const activeProducts = products.filter((p) => p.status === 'ACTIVE');

  return (
    <div>
      <h2 className="mb-6 text-[20px] font-bold">首页精选管理</h2>
      <p className="mb-6 text-[14px] text-muted">勾选要在首页精选区展示的内容，取消后立即移出。最多展示前 4 条。</p>
      <FeaturedManager
        articles={publishedArticles}
        tools={publishedTools}
        products={activeProducts}
        featured={featured}
      />
    </div>
  );
}
