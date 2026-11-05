'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createProductAction, updateProductAction } from '@/lib/actions/products';
import { buttonStyles } from '@/components/ui/button';

type ProductImage = { url: string; alt?: string; sortOrder: number };

type Product = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  images: ProductImage[];
  status: 'ACTIVE' | 'OFF_SHELF';
};

export function ProductEditor({ product }: { product?: Product }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addImage() {
    setImages([...images, { url: '', alt: '', sortOrder: images.length }]);
  }

  function updateImage(index: number, field: keyof ProductImage, value: string) {
    const next = [...images];
    next[index] = { ...next[index], [field]: value };
    setImages(next);
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i })));
  }

  function moveImage(index: number, direction: 'up' | 'down') {
    const next = [...images];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  async function handleSubmit(intent: 'draft' | 'publish') {
    setError(null);
    setPending(true);
    try {
      const input = {
        name,
        slug: slug || undefined,
        description,
        images: images.filter((img) => img.url.trim()),
        intent,
      };
      const result = product?.id
        ? await updateProductAction({ ...input, id: product.id })
        : await createProductAction(input);

      if (result.ok) {
        router.push('/studio/products');
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError('服务暂时不可用，请稍后重试');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-[800px]">
      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-[14px] font-medium">商品名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full rounded-md border border-line px-4 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-medium">Slug（留空自动生成）</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="h-12 w-full rounded-md border border-line px-4 font-mono text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-medium">商品描述 *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-line px-4 py-3 text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-[14px] font-medium">商品图片（1~8 张，第一张为主图）*</label>
            <button type="button" onClick={addImage} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
              ＋ 添加图片
            </button>
          </div>
          {images.map((image, index) => (
            <div key={index} className="mb-3 flex items-center gap-3 rounded-md border border-line bg-white p-3">
              <span className="text-[12px] text-muted">#{index + 1}</span>
              <input
                type="url"
                value={image.url}
                onChange={(e) => updateImage(index, 'url', e.target.value)}
                placeholder="图片 URL"
                className="h-10 flex-1 rounded-md border border-line px-3 text-[13px] outline-none focus:border-brand"
              />
              <input
                type="text"
                value={image.alt ?? ''}
                onChange={(e) => updateImage(index, 'alt', e.target.value)}
                placeholder="alt 文本（可选）"
                className="h-10 w-[180px] rounded-md border border-line px-3 text-[13px] outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => moveImage(index, 'up')}
                disabled={index === 0}
                className="rounded border border-line px-2 py-1 text-[12px] disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveImage(index, 'down')}
                disabled={index === images.length - 1}
                className="rounded border border-line px-2 py-1 text-[12px] disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="rounded border border-danger px-2 py-1 text-[12px] text-danger"
              >
                删除
              </button>
            </div>
          ))}
        </div>
        {error ? (
          <p role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={pending}
            className={buttonStyles({ variant: 'secondary' })}
          >
            保存草稿
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('publish')}
            disabled={pending}
            className={buttonStyles()}
          >
            发布商品
          </button>
        </div>
      </div>
    </div>
  );
}
