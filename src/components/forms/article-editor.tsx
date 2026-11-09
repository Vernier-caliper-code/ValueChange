'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { createArticleAction, updateArticleAction } from '@/lib/actions/articles';
import { MarkdownContent } from '@/components/content/markdown-content';
import { uploadImageAction } from '@/lib/actions/upload';
import { buttonStyles } from '@/components/ui/button';
import { ImageUpload } from './image-upload';

type Article = {
  id?: string;
  title: string;
  slug: string;
  contentMd: string;
  excerpt: string;
  coverUrl: string;
  category: 'AI_FULLSTACK' | 'PERSPECTIVE';
  status: 'DRAFT' | 'PUBLISHED';
};

export function ArticleEditor({ article }: { article?: Article }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [contentMd, setContentMd] = useState(article?.contentMd ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [coverUrl, setCoverUrl] = useState(article?.coverUrl ?? '');
  const [category, setCategory] = useState<'AI_FULLSTACK' | 'PERSPECTIVE'>(article?.category ?? 'AI_FULLSTACK');
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
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="Markdown 语法"]');
    if (!textarea) {
      setContentMd((prev) => prev + '\n\n' + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = contentMd.slice(0, start);
    const after = contentMd.slice(end);
    const insertion = `\n\n${text}\n\n`;
    setContentMd(before + insertion + after);
    // 恢复焦点并把光标移到插入内容之后
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
      const input = { title, slug: slug || undefined, contentMd, excerpt, coverUrl, category, intent };
      const result = article?.id
        ? await updateArticleAction({ ...input, id: article.id })
        : await createArticleAction(input);

      if (result.ok) {
        router.push('/studio/articles');
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
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-[14px] font-medium">标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入文章标题"
            className="h-12 w-full rounded-md border border-line px-4 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-medium">Slug（留空自动生成）</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-article-slug"
            className="h-12 w-full rounded-md border border-line px-4 font-mono text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-medium">板块</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'AI_FULLSTACK' | 'PERSPECTIVE')}
            className="h-12 w-full rounded-md border border-line px-4 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="AI_FULLSTACK">AI 全栈</option>
            <option value="PERSPECTIVE">经验分享</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-medium">摘要（留空自动生成 150 字）</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="手动填写摘要，或留空自动截取"
            rows={3}
            className="w-full rounded-md border border-line px-4 py-3 text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-medium">封面图（可选）</label>
          <ImageUpload value={coverUrl} onChange={setCoverUrl} disabled={pending} />
          {coverUrl ? (
            <div className="mt-3 overflow-hidden rounded-md border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="封面预览" className="max-h-[200px] w-full object-cover" />
            </div>
          ) : null}
        </div>
        <input
          ref={contentImageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleContentImageUpload}
          className="hidden"
        />
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-[14px] font-medium">正文（Markdown）*</label>
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
            value={contentMd}
            onChange={(e) => setContentMd(e.target.value)}
            placeholder="支持 Markdown 语法：## 标题、**加粗**、代码块等"
            rows={20}
            className="h-full min-h-[400px] w-full rounded-md border border-line px-4 py-3 font-mono text-[14px] leading-[1.8] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
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
            发布文章
          </button>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-[14px] font-medium">实时预览</label>
        <div className="rounded-lg border border-line bg-white p-6">
          {contentMd ? (
            <MarkdownContent content={contentMd} />
          ) : (
            <p className="text-[14px] text-muted">输入正文后，这里会显示渲染效果。</p>
          )}
        </div>
      </div>
    </div>
  );
}
