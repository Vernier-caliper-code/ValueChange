'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { createProductAction, updateProductAction } from '@/lib/actions/products';
import { uploadImageAction } from '@/lib/actions/upload';
import { buttonStyles } from '@/components/ui/button';
import { ImageUpload } from './image-upload';

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
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);

  async function handleContentImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingContentImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadImageAction(formData);
      if (!result.ok) {
        throw new Error(result.error ?? '上传失败');
      }
      insertAtCursor(`![${file.name.replace(/\.[^.]+$/, '')}](${result.url!})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '插图失败');
    } finally {
      setUploadingContentImage(false);
      if (contentImageInputRef.current) contentImageInputRef.current.value = '';
    }
  }

  function insertVideoEmbed() {
    const embedCode = `<iframe src="https://player.bilibili.com/player.html?bvid=你的BV号" allowfullscreen></iframe>`;
    insertAtCursor(embedCode);
  }

  function insertAtCursor(text: string) {
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="Markdown"]');
    if (!textarea) {
      setDescription((prev) => prev + '\n\n' + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = description.slice(0, start);
    const after = description.slice(end);
    const insertion = `\n\n${text}\n\n`;
    setDescription(before + insertion + after);
    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

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
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-[14px] font-medium">商品描述（Markdown）*</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => contentImageInputRef.current?.click()}
                disabled={pending || uploadingContentImage}
                className={buttonStyles({ variant: 'ghost', size: 'sm' })}
              >
                {uploadingContentImage ? '上传中…' : '插图'}
              </button>
              <button
                type="button"
                onClick={insertVideoEmbed}
                disabled={pending}
                className={buttonStyles({ variant: 'ghost', size: 'sm' })}
              >
                嵌入视频
              </button>
            </div>
          </div>
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
          <input
            ref={contentImageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleContentImageUpload}
            className="hidden"
          />
          {images.map((image, index) => (
            <div key={index} className="mb-3 flex items-center gap-3 rounded-md border border-line bg-white p-3">
              <span className="text-[12px] text-muted">#{index + 1}</span>
              <div className="flex-1">
                <ImageUpload
                  value={image.url}
                  onChange={(url) => updateImage(index, 'url', url)}
                  disabled={pending}
                />
              </div>
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
