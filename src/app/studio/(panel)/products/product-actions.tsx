'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

import { deleteProductAction, setProductStatusAction } from '@/lib/actions/products';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type Product = {
  id: string;
  name: string;
  status: 'ACTIVE' | 'OFF_SHELF';
};

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleToggleStatus() {
    setPending(true);
    try {
      await setProductStatusAction(product.id, product.status === 'ACTIVE' ? 'OFF_SHELF' : 'ACTIVE');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    setPending(true);
    try {
      await deleteProductAction(product.id);
      setShowDelete(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/studio/products/${product.id}`} className="text-[13px] text-brand hover:underline">
        编辑
      </Link>
      <button
        type="button"
        onClick={handleToggleStatus}
        disabled={pending}
        className="text-[13px] text-muted hover:text-ink disabled:opacity-50"
      >
        {product.status === 'ACTIVE' ? '下架' : '上架'}
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
        title="删除商品"
        description={`确定要删除「${product.name}」吗？删除后无法恢复。`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
