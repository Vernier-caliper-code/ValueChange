'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { ArticleToc } from '@/components/content/article-toc';
import type { Heading } from '@/lib/utils/markdown-text';

/** 移动端文章目录：右下角浮动按钮 + 底部弹出抽屉。桌面端不渲染。 */
export function ArticleTocMobile({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  if (headings.length === 0) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="打开本文目录"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex h-11 items-center gap-2 rounded-full bg-brand px-4 text-[13px] font-semibold text-white shadow-lg"
      >
        ☰ 目录
      </button>
      <button
        type="button"
        aria-label="关闭目录"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-label="本文目录"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-line bg-white p-6 transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">本文目录</h2>
          <button
            type="button"
            aria-label="关闭目录"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-muted hover:text-ink"
          >
            ✕
          </button>
        </div>
        <ArticleToc headings={headings} onNavigate={() => setOpen(false)} />
      </div>
    </div>,
    document.body,
  );
}