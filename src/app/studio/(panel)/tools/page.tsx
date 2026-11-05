import Link from 'next/link';

import { getAdminTools } from '@/lib/actions/tools';
import { formatDate } from '@/lib/utils/date';
import { buttonStyles } from '@/components/ui/button';
import { ToolActions } from './tool-actions';

export default async function StudioToolsPage() {
  const tools = await getAdminTools();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[20px] font-bold">工具列表</h2>
        <Link href="/studio/tools/new" className={buttonStyles({ size: 'sm' })}>
          ＋ 添加工具
        </Link>
      </div>
      <div className="rounded-lg border border-line bg-white">
        <table className="w-full">
          <thead className="border-b border-line">
            <tr>
              <th className="px-4 py-3 text-left text-[13px] font-medium">工具名称</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">功能摘要</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">更新时间</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">状态</th>
              <th className="px-4 py-3 text-left text-[13px] font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[14px]">{tool.name}</td>
                <td className="px-4 py-3 text-[13px] text-muted">{tool.summary}</td>
                <td className="px-4 py-3 text-[13px] text-muted">{formatDate(tool.updatedAt)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[11px] ${tool.status === 'PUBLISHED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {tool.status === 'PUBLISHED' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ToolActions tool={tool} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
