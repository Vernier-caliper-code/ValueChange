import Link from 'next/link';

import { SmartImage } from '@/components/ui/smart-image';
import type { ProductImage, PublicProduct } from '@/lib/data/products';

export function ProductCard({ product }: { product: PublicProduct & { cover: ProductImage | null } }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-[9px] border border-line bg-white transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(24,35,54,0.03)]"
    >
      <div className="overflow-hidden bg-soft-blue">
        {product.cover ? (
          <SmartImage
            src={product.cover.url}
            alt={product.cover.alt ?? product.name}
            width={640}
            height={400}
            className="aspect-[1.6] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="px-6 pb-6 pt-5">
        <h2 className="text-[19px] font-semibold group-hover:text-brand">{product.name}</h2>
        <p className="mb-4 mt-2 line-clamp-2 text-[12px] leading-[1.9] text-muted">{product.description}</p>
        <span className="inline-flex items-center text-[12px] font-semibold text-brand group-hover:underline group-hover:underline-offset-4">
          了解更多 <span aria-hidden="true" className="ml-2">↗</span>
        </span>
      </div>
    </Link>
  );
}
