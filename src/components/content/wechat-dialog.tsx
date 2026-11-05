'use client';

import { useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { buttonStyles } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { WECHAT_ID, WECHAT_QR_URL } from '@/lib/site-content';

export function WechatConsultButton({ productSlug }: { productSlug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleOpen() {
    setOpen(true);
    trackEvent('Product', 'open_wechat_qr', productSlug);
  }

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
    <>
      <button type="button" onClick={handleOpen} className={buttonStyles()}>
        微信咨询这件作品 <span aria-hidden="true">↗</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} labelledBy="wechat-title" describedBy="wechat-description">
        <button
          type="button"
          data-modal-close
          aria-label="关闭微信咨询窗口"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[20px] text-muted hover:bg-paper"
        >
          ×
        </button>
        <p className="text-center font-mono text-[11px] tracking-[1.8px] text-brand">LET&apos;S TALK</p>
        <h2 id="wechat-title" className="mt-3 text-center text-[22px] font-bold">
          聊聊你的想法
        </h2>
        <p id="wechat-description" className="mt-2 text-center text-[13px] leading-[1.9] text-muted">
          对这件商品感兴趣？扫码添加微信，备注「ValuePass」。
        </p>
        <div className="mt-5 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WECHAT_QR_URL} alt="站长微信二维码" className="h-[180px] w-[180px] rounded-lg border border-line" />
        </div>
        <p className="mt-4 text-center text-[13px] text-muted">
          微信号：<strong className="text-ink">{WECHAT_ID}</strong>{' '}
          <button type="button" onClick={handleCopy} className="ml-1 font-semibold text-brand hover:underline">
            {copied ? '已复制 ✓' : '复制'}
          </button>
          <br />
          本站不直接售卖商品，具体事宜请微信沟通。
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`${buttonStyles({ variant: 'secondary', size: 'sm' })} mx-auto mt-5 flex`}
        >
          我先再看看
        </button>
      </Modal>
    </>
  );
}
