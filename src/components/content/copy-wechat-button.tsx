'use client';

import { useState } from 'react';

import { WECHAT_ID } from '@/lib/site-content';

export function CopyWechatButton() {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(WECHAT_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-auto text-[12px] font-semibold text-brand hover:underline hover:underline-offset-4"
    >
      {copied ? '已复制 ✓' : '复制'}
    </button>
  );
}
