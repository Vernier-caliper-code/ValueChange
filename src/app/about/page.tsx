import type { Metadata } from 'next';

import { CopyWechatButton } from '@/components/content/copy-wechat-button';
import { Container } from '@/components/ui/container';
import { buildMetadata } from '@/lib/seo';
import { ABOUT, WECHAT_ID, WECHAT_QR_URL } from '@/lib/site-content';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: '关于我',
  description: 'ValuePass 站长的个人介绍：AI 全栈开发探索、内容原则与联系方式。',
  path: '/about',
});

export default function AboutPage() {
  return (
    <main id="main">
      <section>
        <Container className="pb-14 pt-[77px]">
          <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[1.8px] text-brand before:block before:h-px before:w-[22px] before:bg-current">
            {ABOUT.heroEyebrow}
          </p>
          <h1 className="my-6 text-[34px] font-bold leading-[1.35] tracking-[-2px] lg:text-[52px]">
            {ABOUT.heroTitle[0]}
            <br />
            <span className="text-brand">{ABOUT.heroTitle[1]}</span>
            <br />
            {ABOUT.heroTitle[2]}
          </h1>
          <p className="max-w-[560px] text-[15px] leading-[2] text-[#657186]">{ABOUT.heroDescription}</p>
        </Container>
      </section>

      <section>
        <Container className="grid gap-12 pb-16 lg:grid-cols-2">
          <div>
            <h2 className="text-[22px] font-bold lg:text-[26px]">{ABOUT.whyTitle}</h2>
            {ABOUT.whyParagraphs.map((paragraph, index) => (
              <p key={index} className="mt-4 text-[14px] leading-[2] text-[#3c485b]">
                {paragraph}
              </p>
            ))}
          </div>
          <div>
            <h2 className="text-[22px] font-bold lg:text-[26px]">{ABOUT.principlesTitle}</h2>
            <ul className="mt-4 flex flex-col gap-5">
              {ABOUT.principles.map((principle) => (
                <li key={principle.title} className="rounded-[9px] border border-line bg-white p-5">
                  <strong className="text-[15px]">{principle.title}</strong>
                  <p className="mt-1.5 text-[13px] leading-[1.9] text-muted">{principle.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section id="contact" className="border-t border-line bg-white">
        <Container className="grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[1.8px] text-brand before:block before:h-px before:w-[22px] before:bg-current">
              {ABOUT.contact.eyebrow}
            </p>
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
