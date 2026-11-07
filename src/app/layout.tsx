import type { Metadata } from 'next';

import { BaiduAnalytics } from '@/components/layout/baidu-analytics';
import { SITE_URL } from '@/lib/seo';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ValuePass｜把 AI 产品从想法做到上线',
    template: '%s｜ValuePass',
  },
  description: '分享 AI 全栈开发、实用工具、真实经验与 AI+X 思考的个人网站。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baiduId = process.env.NODE_ENV === 'production' ? process.env.BAIDU_ANALYTICS_ID : undefined;
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        {children}
        <BaiduAnalytics id={baiduId} />
      </body>
    </html>
  );
}