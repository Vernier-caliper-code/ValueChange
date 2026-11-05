'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

import { deleteArticleAction, setArticleStatusAction } from '@/lib/actions/articles';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type Article = {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
};

export function ArticleActions({ article }: { article: Article }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleToggleStatus() {
    setPending(true);
    try {
      await setArticleStatusAction(article.id, article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    setPending(true);
    try {
      await deleteArticleAction(article.id);
      setShowDelete(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/studio/articles/${article.id}`} className="text-[13px] text-brand hover:underline">
        编辑
      </Link>
      <button
        type="button"
        onClick={handleToggleStatus}
        disabled={pending}
        className="text-[13px] text-muted hover:text-ink disabled:opacity-50"
      >
        {article.status === 'PUBLISHED' ? '撤回' : '发布'}
      </button>
      <button
        type="button"
        onClick={() => setShowDelete(true)}
        className="text-[13px] text-danger hover:underline"
      >
        删除
      </button>
      <ConfirmDialog
        open={showDelete}
        title="删除文章"
        description={`确定要删除「${article.title}」吗？删除后无法恢复。`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
