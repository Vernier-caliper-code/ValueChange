import Link from 'next/link';

import { SmartImage } from '@/components/ui/smart-image';
import type { PublicTool } from '@/lib/data/tools';

export function ToolCard({ tool }: { tool: PublicTool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex overflow-hidden rounded-[9px] border border-line bg-white transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(24,35,54,0.03)]"
    >
      <div className="flex w-2/3 flex-col px-6 pb-6 pt-5">
        <h2 className="text-[19px] font-semibold group-hover:text-brand">{tool.name}</h2>
        <p className="mb-4 mt-2 line-clamp-3 text-[12px] leading-[1.9] text-muted">{tool.summary}</p>
        <span className="mt-auto inline-flex items-center text-[12px] font-semibold text-brand group-hover:underline group-hover:underline-offset-4">
          看看我的使用方式 <span aria-hidden="true" className="ml-2">↗</span>
        </span>
      </div>
      <div className="relative w-1/3 overflow-hidden bg-soft-blue">
        <SmartImage
          src={tool.imageUrl}
          alt={tool.name}
          width={320}
          height={240}
          className="h-full w-full object-cover"
        />
      </div>
    </Link>
  );
}