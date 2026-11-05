import type { Metadata } from 'next';

import { PageIntro } from '@/components/content/page-intro';
import { ToolCard } from '@/components/content/tool-card';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { getTools } from '@/lib/data/tools';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: 'AI 工具',
  description: '分享真正用过的开发软件、MCP 与 Skill。不罗列参数，只讲它们能解决什么问题。',
  path: '/tools',
});

export default async function ToolsPage() {
  const tools = await getTools();
  return (
    <main id="main">
      <PageIntro
        eyebrow="THE TOOLKIT / LESS, BUT BETTER"
        title="称手的工具，让创造更自然。"
        description="分享真正用过的开发软件、MCP 与 Skill。不罗列参数，只讲它们能解决什么问题，以及我如何使用。"
        footnote="TOOLS & WORKFLOWS · 工具是起点，效率是结果"
      />
      <Container className="pb-[75px] pt-10">
        {tools.length > 0 ? (
          <section aria-label="AI 工具列表" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </section>
        ) : (
          <EmptyState
            title="内容筹备中"
            description="工具箱正在整理。先去看看 AI 全栈的文章吧。"
            actionHref="/articles"
            actionLabel="阅读 AI 全栈文章"
          />
        )}
      </Container>
    </main>
  );
}
