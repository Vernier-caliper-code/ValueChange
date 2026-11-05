'use client';

import { useState } from 'react';

import { setFeaturedAction, moveFeaturedAction } from '@/lib/actions/featured';

type Entity = {
  id: string;
  title?: string;
  name?: string;
};

type FeaturedItem = {
  id: string;
  entityType: 'ARTICLE' | 'TOOL' | 'PRODUCT';
  entityId: string;
  sortOrder: number;
};

export function FeaturedManager({
  articles,
  tools,
  products,
  featured,
}: {
  articles: Entity[];
  tools: Entity[];
  products: Entity[];
  featured: FeaturedItem[];
}) {
  const [pending, setPending] = useState<string | null>(null);

  function isFeatured(entityType: string, entityId: string) {
    return featured.some((f) => f.entityType === entityType && f.entityId === entityId);
  }

  async function handleToggle(entityType: 'ARTICLE' | 'TOOL' | 'PRODUCT', entityId: string) {
    const key = `${entityType}:${entityId}`;
    setPending(key);
    try {
      const current = isFeatured(entityType, entityId);
      await setFeaturedAction(entityType, entityId, !current);
    } finally {
      setPending(null);
    }
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    setPending(id);
    try {
      await moveFeaturedAction(id, direction);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {(['ARTICLE', 'TOOL', 'PRODUCT'] as const).map((type) => {
        const entities = type === 'ARTICLE' ? articles : type === 'TOOL' ? tools : products;
        const label = type === 'ARTICLE' ? '文章' : type === 'TOOL' ? '工具' : '商品';
        return (
          <div key={type} className="rounded-lg border border-line bg-white p-5">
            <h3 className="mb-4 text-[16px] font-semibold">{label}</h3>
            {entities.length === 0 ? (
              <p className="text-[13px] text-muted">暂无已发布/上架的{label}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {entities.map((entity) => {
                  const featuredItem = featured.find((f) => f.entityType === type && f.entityId === entity.id);
                  const isF = !!featuredItem;
                  const pendingKey = `${type}:${entity.id}`;
                  return (
                    <div key={entity.id} className="flex items-center justify-between rounded-md border border-line p-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isF}
                          onChange={() => handleToggle(type, entity.id)}
                          disabled={pending === pendingKey}
                          className="h-4 w-4"
                        />
                        <span className="text-[14px]">{entity.title ?? entity.name}</span>
                      </div>
                      {isF && featuredItem ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-muted">排序 {featuredItem.sortOrder}</span>
                          <button
                            type="button"
                            onClick={() => handleMove(featuredItem.id, 'up')}
                            disabled={pending === featuredItem.id}
                            className="rounded border border-line px-2 py-1 text-[12px] disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(featuredItem.id, 'down')}
                            disabled={pending === featuredItem.id}
                            className="rounded border border-line px-2 py-1 text-[12px] disabled:opacity-30"
                          >
                            ↓
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
