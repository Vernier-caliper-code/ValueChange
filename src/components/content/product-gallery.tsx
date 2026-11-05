'use client';

import { useState } from 'react';

import { SmartImage } from '@/components/ui/smart-image';
import type { ProductImage } from '@/lib/data/products';

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const main = images[activeIndex];
  if (!main) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-[10px] border border-line bg-white">
        <SmartImage
          src={main.url}
          alt={main.alt ?? productName}
          width={1200}
          height={750}
          className="aspect-[1.6] w-full object-cover"
          priority
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-3" aria-label="商品图片">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`查看第 ${index + 1} 张商品图片`}
              aria-pressed={index === activeIndex}
              className={`overflow-hidden rounded-[7px] border-2 transition-colors ${
                index === activeIndex ? 'border-brand' : 'border-transparent hover:border-line'
              }`}
            >
              <SmartImage src={image.url} alt="" width={160} height={100} className="aspect-[1.6] w-[92px] object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
