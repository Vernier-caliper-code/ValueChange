'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { createToolAction, updateToolAction } from '@/lib/actions/tools';
import { uploadImageAction } from '@/lib/actions/upload';
import { buttonStyles } from '@/components/ui/button';
import { ImageUpload } from './image-upload';

type Tool = {
  id?: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  status: 'DRAFT' | 'PUBLISHED';
};

export function ToolEditor({ tool }: { tool?: Tool }) {
  const router = useRouter();
  const [name, setName] = useState(tool?.name ?? '');
  const [slug, setSlug] = useState(tool?.slug ?? '');
  const [summary, setSummary] = useState(tool?.summary ?? '');
  const [description, setDescription] = useState(tool?.description ?? '');
  const [imageUrl, setImageUrl] = useState(tool?.imageUrl ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(tool?.websiteUrl ?? '');
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

  async function handleSubmit(intent: 'draft' | 'publish') {
    setError(null);
    setPending(true);
    try {
      const input = { name, slug: slug || undefined, summary, description, imageUrl, websiteUrl, intent };
      const result = tool?.id
        ? await updateToolAction({ ...input, id: tool.id })
        : await createToolAction(input);

      if (result.ok) {
        router.push('/studio/tools');
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
    <div className="max-w-[640px]">
      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-[14px] font-medium">工具名称 *</label>
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
          <label className="mb-2 block text-[14px] font-medium">功能摘要 *</label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="一句话说明工具解决什么问题"
            className="h-12 w-full rounded-md border border-line px-4 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-[14px] font-medium">详细介绍（Markdown）</label>
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
            rows={8}
            className="w-full rounded-md border border-line px-4 py-3 font-mono text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-medium">工具图片 *</label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} disabled={pending} />
          <input
            ref={contentImageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleContentImageUpload}
            className="hidden"
          />
          {imageUrl ? (
            <div className="mt-3 overflow-hidden rounded-md border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="工具图片预览" className="max-h-[200px] w-full object-cover" />
            </div>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-medium">官网链接 *</label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://..."
            className="h-12 w-full rounded-md border border-line px-4 text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
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
            发布工具
          </button>
        </div>
      </div>
    </div>
  );
}
