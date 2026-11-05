import Link from 'next/link';

import { getAdminProducts } from '@/lib/actions/products';
import { formatDate } from '@/lib/utils/date';
import { buttonStyles } from '@/components/ui/button';
import { ProductActions } from './product-actions';

export default async function StudioProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[20px] font-bold">商品列表</h2>
        <Link href="/studio/products/new" className={buttonStyles({ size: 'sm' })}>
          ＋ 添加商品
        </Link>
      </div>
      <div className="rounded-lg border border-line bg-white">
        <table className="w-full">
          <thead className="border-b border-line">
            <tr>
              <th className="px-4 py-3 text-left text-[13px] font-medium">商品名称</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">图片数</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">更新时间</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">状态</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[14px]">{product.name}</td>
                <td className="px-4 py-3 text-[13px] text-muted">{product.images.length} 张</td>
                <td className="px-4 py-3 text-[13px] text-muted">{formatDate(product.updatedAt)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[11px] ${product.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {product.status === 'ACTIVE' ? '在售展示' : '已下架'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ProductActions product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
