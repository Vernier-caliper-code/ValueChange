import Link from 'next/link';

export function Brand({ size = 'md' }: { size?: 'md' | 'sm' }) {
  const imgSize = size === 'md' ? 'h-[34px] w-[34px] lg:h-[37px] lg:w-[37px] rounded-[10px]' : 'h-[31px] w-[31px] rounded-lg';
  return (
    <Link href="/" aria-label="ValuePass 首页" className="flex shrink-0 items-center gap-[11px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/icon.png" alt="ValuePass 标志" className={imgSize} />
      <span>
        <span className={`block font-bold tracking-[-1px] ${size === 'md' ? 'text-[22px]' : 'text-[19px]'}`}>
          Value<span className="text-brand">Pass</span>
        </span>
        {size === 'md' ? (
          <span className="mt-[-4px] block font-mono text-[8px] tracking-[1.5px] text-muted">BUILD · SHARE · GROW</span>
        ) : null}
      </span>
    </Link>
  );
}
