import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumb } from '@/components/content/breadcrumb';
import { MarkdownContent } from '@/components/content/markdown-content';
import { ToolWebsiteLink } from '@/components/content/tool-website-link';
import { Container } from '@/components/ui/container';
import { SmartImage } from '@/components/ui/smart-image';
import { getToolBySlug, getTools } from '@/lib/data/tools';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: '工具不存在' };
  return buildMetadata({
    title: `${tool.name}｜AI 工具`,
    description: tool.summary,
    path: `/tools/${tool.slug}`,
    imageUrl: tool.imageUrl,
  });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <main id="main">
      <section className="border-b border-line">
        <Container className="pb-10 pt-[53px]">
          <Breadcrumb
            items={[
              { label: '首页', href: '/' },
              { label: 'AI 工具', href: '/tools' },
              { label: tool.name },
            ]}
          />
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="h-[120px] w-[180px] shrink-0 overflow-hidden rounded-[10px] border border-line bg-soft-blue">
              <SmartImage src={tool.imageUrl} alt={tool.name} width={360} height={240} className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-[28px] font-bold leading-[1.5] tracking-[-1.2px] lg:text-[39px]">{tool.name}</h1>
              <p className="mt-3 max-w-[650px] text-[15px] leading-[1.9] text-muted">{tool.summary}</p>
            </div>
          </div>
        </Container>
      </section>
      <Container className="grid grid-cols-1 gap-12 pb-[75px] pt-[43px] lg:grid-cols-[minmax(0,1fr)_260px]">
        <article>
          <MarkdownContent content={tool.description} />
        </article>
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-[10px] border border-line bg-white p-6">
            <h2 className="text-[15px] font-semibold">亲自试试看</h2>
            <p className="mb-5 mt-2 text-[12px] leading-[1.9] text-muted">
              工具是否适合自己，最好的答案来自你的真实工作流。前往官网了解最新功能与使用条款。
            </p>
            <ToolWebsiteLink url={tool.websiteUrl} name={tool.name} slug={tool.slug} />
            <p className="mt-3 text-[10px] leading-[1.8] text-[#929ba9]">
              外部链接 · 新窗口打开
              <br />
              官网地址与产品信息以官方页面为准
            </p>
          </div>
        </aside>
      </Container>
    </main>
  );
}
