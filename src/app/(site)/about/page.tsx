import type { Metadata } from 'next';

import { CopyWechatButton } from '@/components/content/copy-wechat-button';
import { Container } from '@/components/ui/container';
import { buildMetadata } from '@/lib/seo';
import { ABOUT, WECHAT_ID, WECHAT_QR_URL } from '@/lib/site-content';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: '关于我',
  description: '游标卡尺：一名软件工程师。为什么做 ValuePass——AI 时代，软件工程的思想比任何时候都重要。',
  path: '/about',
});

export default function AboutPage() {
  return (
    <main id="main">
      <section>
        <Container className="pb-14 pt-[77px]">
          <h1 className="my-6 text-[34px] font-bold leading-[1.35] tracking-[-2px] lg:text-[52px]">
            {ABOUT.heroTitle[0]}
            <br />
            <span className="text-brand">{ABOUT.heroTitle[1]}</span>
          </h1>
          <p className="max-w-[560px] text-[15px] leading-[2] text-[#657186]">{ABOUT.heroDescription}</p>
        </Container>
      </section>

      <section aria-labelledby="why-title">
        <Container className="pb-16">
          <h2 id="why-title" className="text-[22px] font-bold lg:text-[26px]">{ABOUT.whyTitle}</h2>
          <div className="max-w-[720px]">
            {ABOUT.whyParagraphs.map((paragraph, index) => (
              <p key={index} className="mt-4 text-[14px] leading-[2] text-[#3c485b]">
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <section id="contact" className="border-t border-line bg-white">
        <Container className="grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="mt-4 text-[25px] font-bold leading-[1.45] lg:text-[30px]">{ABOUT.contact.title}</h2>
            <p className="mt-4 max-w-[460px] text-[14px] leading-[2] text-muted">{ABOUT.contact.body}</p>
            <div className="mt-6 flex items-center gap-4 rounded-[9px] border border-line bg-paper px-5 py-4">
              <strong className="text-[13px]">微信号</strong>
              <span className="font-mono text-[15px] tracking-[0.5px]">{WECHAT_ID}</span>
              <CopyWechatButton />
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={WECHAT_QR_URL}
              alt="站长微信二维码"
              className="h-[220px] w-[220px] rounded-xl border border-line bg-white p-2"
            />
            <p className="text-center text-[12px] leading-[1.9] text-muted">{ABOUT.contact.qrCaption}</p>
          </div>
        </Container>
      </section>
    </main>
  );
}