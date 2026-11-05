import Link from 'next/link';

import { getAdminArticles } from '@/lib/actions/articles';
import { getAdminTools } from '@/lib/actions/tools';
import { getAdminProducts } from '@/lib/actions/products';
import { getFeaturedItems } from '@/lib/actions/featured';
import { buttonStyles } from '@/components/ui/button';

export default async function StudioDashboardPage() {
  const [articles, tools, products, featured] = await Promise.all([
    getAdminArticles(),
    getAdminTools(),
    getAdminProducts(),
    getFeaturedItems(),
  ]);

  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED').length;
  const draftArticles = articles.length - publishedArticles;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-[24px] font-bold">让每一次实践，都留下痕迹。</h2>
        <p className="mt-2 text-[14px] text-muted">管理你的 AI 全栈与经验分享文章。</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-line bg-white p-5">
          <span className="text-[13px] text-muted">全部文章</span>
          <strong className="mt-2 block text-[32px] font-bold">{articles.length}</strong>
          <small className="text-[12px] text-muted">AI 全栈 {articles.filter((a) => a.category === 'AI_FULLSTACK').length} · 经验分享 {articles.filter((a) => a.category === 'PERSPECTIVE').length}</small>
        </div>
        <div className="rounded-lg border border-line bg-white p-5">
          <span className="text-[13px] text-muted">已发布</span>
          <strong className="mt-2 block text-[32px] font-bold text-success">{publishedArticles}</strong>
          <small className="text-[12px] text-muted">内容正常对外展示</small>
        </div>
        <div className="rounded-lg border border-line bg-white p-5">
          <span className="text-[13px] text-muted">草稿箱</span>
          <strong className="mt-2 block text-[32px] font-bold text-warning">{draftArticles}</strong>
          <small className="text-[12px] text-muted">继续完成未竟的想法</small>
        </div>
        <div className="rounded-lg border border-line bg-white p-5">
          <span className="text-[13px] text-muted">首页精选</span>
          <strong className="mt-2 block text-[32px] font-bold text-brand">{featured.length}</strong>
          <small className="text-[12px] text-muted">手动推荐的内容</small>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Link href="/studio/articles/new" className={`${buttonStyles()} justify-center`}>
          ＋ 写一篇新文章
        </Link>
        <Link href="/studio/tools" className={`${buttonStyles({ variant: 'secondary' })} justify-center`}>
          管理工具 ({tools.length})
        </Link>
        <Link href="/studio/products" className={`${buttonStyles({ variant: 'secondary' })} justify-center`}>
          管理商品 ({products.length})
        </Link>
      </div>
    </div>
  );
}
