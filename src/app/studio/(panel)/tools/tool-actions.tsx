'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

import { deleteToolAction, setToolStatusAction } from '@/lib/actions/tools';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type Tool = {
  id: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED';
};

export function ToolActions({ tool }: { tool: Tool }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleToggleStatus() {
    setPending(true);
    try {
      await setToolStatusAction(tool.id, tool.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    setPending(true);
    try {
      await deleteToolAction(tool.id);
      setShowDelete(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/studio/tools/${tool.id}`} className="text-[13px] text-brand hover:underline">
        编辑
      </Link>
      <button
        type="button"
        onClick={handleToggleStatus}
        disabled={pending}
        className="text-[13px] text-muted hover:text-ink disabled:opacity-50"
      >
        {tool.status === 'PUBLISHED' ? '撤回' : '发布'}
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
        title="删除工具"
        description={`确定要删除「${tool.name}」吗？删除后无法恢复。`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
