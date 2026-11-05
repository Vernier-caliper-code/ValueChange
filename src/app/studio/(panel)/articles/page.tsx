import Link from 'next/link';

import { getAdminArticles } from '@/lib/actions/articles';
import { formatDate } from '@/lib/utils/date';
import { buttonStyles } from '@/components/ui/button';

export default async function StudioArticlesPage() {
  const articles = await getAdminArticles();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[20px] font-bold">文章列表</h2>
        <Link href="/studio/articles/new" className={buttonStyles({ size: 'sm' })}>
          ＋ 写一篇新文章
        </Link>
      </div>
      <div className="rounded-lg border border-line bg-white">
        <table className="w-full">
          <thead className="border-b border-line">
            <tr>
              <th className="px-4 py-3 text-left text-[13px] font-medium">标题</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">板块</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">更新时间</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">状态</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[14px]">{article.title}</td>
                <td className="px-4 py-3 text-[13px] text-muted">{article.category === 'AI_FULLSTACK' ? 'AI 全栈' : '经验分享'}</td>
                <td className="px-4 py-3 text-[13px] text-muted">{formatDate(article.updatedAt)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[11px] ${article.status === 'PUBLISHED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/studio/articles/${article.id}`} className="text-[13px] text-brand hover:underline">
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
