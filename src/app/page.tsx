import Link from 'next/link';

import { Container } from '@/components/ui/container';
import { SmartImage } from '@/components/ui/smart-image';
import { buttonStyles } from '@/components/ui/button';
import { getHomeData } from '@/lib/data/home';
import { getLatestTools } from '@/lib/data/tools';
import { formatDate } from '@/lib/utils/date';

export const revalidate = 60;

const ENTITY_LABELS = { ARTICLE: '文章', TOOL: '工具', PRODUCT: '商品' } as const;

const PATH_CARDS = [
  {
    number: '01 / ENGINEERING',
    title: 'AI 全栈',
    description: '从需求到上线，分享 AI 产品的技术选型、开发实践与踩坑复盘。',
    more: '一起把产品做出来',
    href: '/articles',
  },
  {
    number: '02 / TOOLKIT',
    title: 'AI 工具',
    description: '亲测好用的开发软件、MCP 与 Skill，让工具真正为工作服务。',
    more: '发现称手的工具',
    href: '/tools',
  },
  {
    number: '03 / PERSPECTIVE',
    title: '经验分享',
    description: '关于成长、职业和 AI+X 的思考。技术是手段，生活才是答案。',
    more: '交换一些真实想法',
    href: '/insights',
  },
  {
    number: '04 / CREATIONS',
    title: '我的商品',
    description: '一些认真做出来的笔记、模板与服务。只展示，聊聊是否适合你。',
    more: '看看我的小作品',
    href: '/products',
  },
] as const;

export default async function HomePage() {
  const [{ featured }, tools] = await Promise.all([getHomeData(), getLatestTools(3)]);
  const [main, ...rest] = featured;

  return (
    <main id="main">
      {/* 1. Hero */}
      <section>
        <Container className="pb-[68px] pt-[77px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-[72px]">
            <div>
              <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[1.8px] text-brand before:block before:h-px before:w-[22px] before:bg-current">
                A PERSONAL SPACE FOR BUILDING
              </p>
              <h1 className="my-6 text-[40px] font-bold leading-[1.27] tracking-[-2.5px] lg:text-[62px]">
                让想法，长成
                <br />
                有价值的<span className="text-brand">产品。</span>
              </h1>
              <p className="max-w-[455px] text-[15px] leading-[2] text-[#657186] lg:text-[16px]">
                我是 ValuePass，一个持续探索 AI 全栈开发的创作者。在这里，分享真实的开发经验、值得用的工具，以及技术如何走进更多行业。
              </p>
              <div className="mt-[34px] flex flex-wrap items-center gap-6">
                <Link href="/articles" className={buttonStyles()}>
                  开始阅读 <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/about" className="inline-flex items-center text-[13px] font-semibold text-brand hover:underline hover:underline-offset-4">
                  认识一下我 <span aria-hidden="true" className="ml-2">→</span>
                </Link>
              </div>
              <p className="mt-[35px] flex items-center gap-2 text-[11px] text-[#7b8595]">
                <span className="h-[5px] w-[5px] rounded-full bg-[#4c9a76]" />
                不追热点，只记录真正做过、想过的事
              </p>
            </div>
            <div className="relative py-4 pl-4">
              <div className="absolute inset-0 right-[22px] rotate-3 rounded-xl bg-[#eaf0fc]" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[10px] shadow-[0_15px_50px_rgba(35,69,135,0.06)]">
                <SmartImage
                  src="/images/architecture.svg"
                  alt="从需求、模型、产品体验到部署的 AI 全栈开发链路示意图"
                  width={1200}
                  height={760}
                  className="w-full"
                  priority
                />
              </div>
              <p className="relative mt-4 text-[11px] text-muted">
                <strong className="font-mono tracking-[1.5px]">BUILD TO LEARN</strong>
                <span className="ml-3">在创造中，持续成长</span>
              </p>
            </div>
          </div>
          <div className="mt-16 flex flex-col gap-3 border-t border-line pt-5 text-[11px] text-[#929ba9] md:flex-row md:items-center md:justify-between">
            <span>AI 全栈开发 / 工具与效率 / 人生与 AI+X</span>
            <span className="font-mono">EST. 2026 — KEEP BUILDING</span>
          </div>
        </Container>
      </section>

      {/* 2. 四板块入口 */}
      <section aria-labelledby="paths-title" className="bg-white">
        <Container className="py-11 lg:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[1.8px] text-brand before:block before:h-px before:w-[22px] before:bg-current">
                EXPLORE THE SPACE
              </p>
              <h2 id="paths-title" className="mt-4 text-[25px] font-bold leading-[1.45] lg:text-[30px]">
                从这里，找到你感兴趣的
              </h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {PATH_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col rounded-[9px] border border-line bg-paper p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-brand/40"
              >
                <span className="font-mono text-[10px] tracking-[1.5px] text-[#929ba9]">{card.number}</span>
                <h3 className="mt-4 text-[20px] font-semibold group-hover:text-brand">{card.title}</h3>
                <p className="mb-6 mt-2 flex-1 text-[12px] leading-[1.9] text-muted">{card.description}</p>
                <span className="text-[12px] font-semibold text-brand">
                  {card.more} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. 精选内容 */}
      <section aria-labelledby="featured-title">
        <Container className="py-11 lg:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[1.8px] text-brand before:block before:h-px before:w-[22px] before:bg-current">
                EDITOR&apos;S PICKS
              </p>
              <h2 id="featured-title" className="mt-4 text-[25px] font-bold leading-[1.45] lg:text-[30px]">
                最近，值得读一读的
              </h2>
            </div>
            <Link href="/articles" className="hidden shrink-0 text-[13px] font-semibold text-brand hover:underline hover:underline-offset-4 md:inline-flex">
              查看全部文章 <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
          {main ? (
            <div className="grid gap-10 lg:grid-cols-2">
              <Link href={main.href} className="group">
                <div className="overflow-hidden rounded-[9px]">
                  <SmartImage
                    src={main.imageUrl ?? '/images/default-article-cover.svg'}
                    alt={main.title}
                    width={1200}
                    height={750}
                    className="aspect-[1.6] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-4 flex items-center gap-3 text-[11px] text-[#929ba9]">
                  <span className="text-brand">{ENTITY_LABELS[main.entityType]}</span>
                  {main.date ? <span>{formatDate(main.date)}</span> : null}
                </div>
                <h3 className="mt-2.5 text-[22px] font-bold leading-[1.5] group-hover:text-brand lg:text-[26px]">
                  {main.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[13px] leading-[1.9] text-muted">{main.description}</p>
              </Link>
              <div className="flex flex-col">
                <div className="flex flex-1 flex-col divide-y divide-line">
                  {rest.map((item, index) => (
                    <Link key={item.href} href={item.href} className="group flex gap-5 py-5 first:pt-0">
                      <span className="font-mono text-[13px] text-[#b7bec8]">{String(index + 2).padStart(2, '0')}</span>
                      <div>
                        <div className="flex items-center gap-3 text-[11px] text-[#929ba9]">
                          <span className={item.entityType === 'ARTICLE' ? 'text-brand' : 'text-[#4e8864]'}>
                            {ENTITY_LABELS[item.entityType]}
                          </span>
                          {item.date ? <span>{formatDate(item.date)}</span> : null}
                        </div>
                        <h3 className="mt-1.5 text-[15px] font-semibold leading-[1.6] group-hover:text-brand">
                          {item.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-[12px] text-muted">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/insights" className="mt-6 inline-flex text-[13px] font-semibold text-brand hover:underline hover:underline-offset-4">
                  读读我的经验与思考 <span aria-hidden="true" className="ml-2">→</span>
                </Link>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-line bg-white px-8 py-12 text-center text-[13px] text-muted">
              内容筹备中，第一批分享正在路上。
            </p>
          )}
        </Container>
      </section>

      {/* 4. 深色工具区（通栏背景） */}
      <section aria-labelledby="tools-title" className="bg-ink text-white">
        <Container className="grid gap-12 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[1.8px] text-[#8fb1ff] before:block before:h-px before:w-[22px] before:bg-current">
              A TOOL IS A GOOD COLLEAGUE
            </p>
            <h2 id="tools-title" className="mt-4 text-[25px] font-bold leading-[1.45] lg:text-[30px]">
              好工具，应该让你
              <br />
              更专注于创造。
            </h2>
            <p className="mt-4 max-w-[420px] text-[13px] leading-[2] text-[#a8b3c7]">
              不做简单的软件清单。只分享那些我真正用过，并且改变了工作方式的工具。
            </p>
            <Link href="/tools" className={`${buttonStyles({ variant: 'light' })} mt-8`}>
              逛逛我的工具箱 <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {tools.length > 0 ? (
              tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group flex items-center gap-4 rounded-[10px] border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/25"
                >
                  <div className="min-w-0 flex-1">
                    <strong className="block text-[15px]">{tool.name}</strong>
                    <p className="mt-1 line-clamp-1 text-[12px] text-[#a8b3c7]">{tool.summary}</p>
                  </div>
                  <span aria-hidden="true" className="text-[18px] text-[#8fb1ff] transition-transform group-hover:translate-x-1">↗</span>
                </Link>
              ))
            ) : (
              <p className="rounded-[10px] border border-dashed border-white/15 p-5 text-[12px] text-[#a8b3c7]">
                工具整理中，即将更新。
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* 5. 商品高亮区 */}
      <section aria-labelledby="creations-title" className="bg-white">
        <Container className="grid items-center gap-12 py-11 lg:grid-cols-2 lg:py-20">
          <div className="overflow-hidden rounded-[10px]">
            <SmartImage
              src="/images/product-notes.svg"
              alt="AI 全栈实战笔记数字手册封面"
              width={1200}
              height={760}
              className="w-full"
            />
          </div>
          <div>
            <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[1.8px] text-brand before:block before:h-px before:w-[22px] before:bg-current">
              MADE WITH CARE
            </p>
            <h2 id="creations-title" className="mt-4 text-[25px] font-bold leading-[1.45] lg:text-[30px]">
              把经验沉淀下来，
              <br />
              也把价值分享出去。
            </h2>
            <p className="mt-4 max-w-[440px] text-[13px] leading-[2] text-muted">
              从一份实战笔记，到一套工作流模板。这里展示我认真做的小作品，也提供与你一起解决问题的机会。
            </p>
            <Link href="/products" className={`${buttonStyles({ variant: 'secondary' })} mt-8`}>
              看看我的商品 <span aria-hidden="true">↗</span>
            </Link>
            <p className="mt-4 text-[11px] text-[#929ba9]">↳ 仅作展示，不在网站直接售卖</p>
          </div>
        </Container>
      </section>

      {/* 6. 品牌格言区 */}
      <section className="py-[62px] text-center lg:py-[74px]">
        <Container>
          <p className="font-serif text-[20px] tracking-[0.3px] text-[#627089] lg:text-[26px]">
            “持续构建，真诚分享，让价值流动。”
          </p>
          <span className="mt-4 block text-[11px] tracking-[2px] text-[#929aa6]">THE VALUEPASS PHILOSOPHY</span>
        </Container>
      </section>
    </main>
  );
}
