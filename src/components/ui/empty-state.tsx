import Link from 'next/link';

import { buttonStyles } from './button';

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line bg-white px-8 py-16 text-center">
      <strong className="text-[18px] font-semibold">{title}</strong>
      <p className="mt-3 max-w-[420px] text-[13px] leading-[1.9] text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={`${buttonStyles({ variant: 'secondary', size: 'sm' })} mt-6`}>
          {actionLabel} <span aria-hidden="true">↗</span>
        </Link>
      ) : null}
    </div>
  );
}
