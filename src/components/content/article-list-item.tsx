import Link from 'next/link';

import { SmartImage } from '@/components/ui/smart-image';
import { DEFAULT_ARTICLE_COVER } from '@/lib/data/constants';
import type { PublicArticle } from '@/lib/data/articles';
import { formatDate } from '@/lib/utils/date';
import { buildExcerpt } from '@/lib/utils/excerpt';
import { getReadingTimeMinutes } from '@/lib/utils/reading-time';

export function ArticleListItem({
  article,
  basePath,
}: {
  article: PublicArticle;
  basePath: '/articles' | '/insights';
}) {
  return (
    <Link
      href={`${basePath}/${article.slug}`}
      className="group grid grid-cols-1 items-center gap-6 border-b border-line py-8 md:grid-cols-[220px_1fr_32px] md:gap-8"
    >
      <div className="overflow-hidden rounded-[7px]">
        <SmartImage
          src={article.coverUrl ?? DEFAULT_ARTICLE_COVER}
          alt={article.title}
          width={352}
          height={220}
          className="aspect-[1.6] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div>
        <div className="flex items-center gap-3 text-[11px] text-[#929ba9]">
          <span>{article.publishedAt ? formatDate(article.publishedAt) : ''}</span>
          <span>{getReadingTimeMinutes(article.contentMd)} 分钟阅读</span>
        </div>
        <h2 className="mt-2.5 text-[18px] font-semibold leading-[1.6] tracking-[-0.4px] group-hover:text-brand lg:text-[21px]">
          {article.title}
        </h2>
        <p className="mt-2 text-[13px] leading-[1.8] text-muted">{buildExcerpt(article.contentMd, article.excerpt)}</p>
      </div>
      <span aria-hidden="true" className="hidden text-[25px] text-[#8c98aa] group-hover:text-brand md:block">↗</span>
    </Link>
  );
}
