'use client';

import Script from 'next/script';

export function BaiduAnalytics({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <Script
      id="baidu-analytics"
      strategy="afterInteractive"
      src={`https://hm.baidu.com/hm.js?${id}`}
    />
  );
}
