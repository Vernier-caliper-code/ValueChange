import Link from 'next/link';

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="面包屑" className="mb-8 flex flex-wrap items-center gap-2.5 text-[11px] text-[#8992a2]">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2.5">
          {index > 0 ? <span className="text-[#b7bec8]">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-brand">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
