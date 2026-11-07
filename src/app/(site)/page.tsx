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
    title: 'AI 全栈',
    description: '一个 AI 产品从想法到上线的完整记录。技术选型、踩坑复盘，全部来自真实项目。',
    href: '/articles',
  },
  {
    title: 'AI 工具',
    description: '只分享我天天在用、真正提升了效率的工具。不罗列参数，只说它解决了什么问题。',
    href: '/tools',
  },
  {
    title: '经验分享',
    description: '关于成长、职业，以及 AI 如何走进传统行业的思考。给想找切入点的人。',
    href: '/insights',
  },
  {
    title: '我的商品',
    description: '最实惠的产品，成就最有价值的事。',
    href: '/products',
  },
] as const;

export default async function HomePage() {
  const [{ featured }, tools] = await Promise.all([getHomeData(), getLatestTools(3)]);
  const [main, ...rest] = featured;

  return (
    <main id="main">
      {/* 1. Hero */}
      <section className="bg-gradient-to-b from-[rgba(239,246,255,0.6)] to-transparent">
        <Container className="pb-[68px] pt-[50px] lg:pt-[77px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-[72px]">
            <div>
              <h1 className="my-6 text-[40px] font-bold leading-[1.27] tracking-[-2.5px] lg:text-[62px]">
                把 AI 产品
                <br />
                从想法做到上线，
                <br />
                每一步都能<span className="text-brand">跟着做。</span>
              </h1>
              <p className="max-w-[455px] text-[15px] leading-[2] text-[#657186] lg:text-[16px]">
                大家好，我是游标卡尺，一个专注于技术提升和分享的博主，正在用 AI 全栈技术做真实的产品。这里记录全过程：技术怎么选、坑怎么踩、什么工具好用——新手能跟着入门，同行能对答案。
              </p>
              <div className="mt-[34px] flex flex-wrap items-center gap-6">
                <Link href="/articles" className={buttonStyles()}>
                  开始阅读 <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/about" className="inline-flex items-center text-[13px] font-semibold text-brand hover:underline hover:underline-offset-4">
                  认识一下我 <span aria-hidden="true" className="ml-2">→</span>
                </Link>
              </div>
            </div>
            <div className="relative py-4 pl-4">
              <div className="absolute inset-0 right-[22px] rotate-3 rounded-xl bg-[#eaf0fc]" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[10px] shadow-[0_15px_50px_rgba(35,69,135,0.06)]">
                <SmartImage
                  src="/images/architecture.svg"
                  alt="ValuePass 网站功能地图：读文章、用工具、看思考、买产品、注册、联系的读者旅程示意图"
                  width={1200}
                  height={760}
                  className="w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. 四板块入口 */}
      <section aria-labelledby="paths-title" className="bg-white">
        <Container className="py-11 lg:py-20">
          <h2 id="paths-title" className="mb-10 text-[25px] font-bold leading-[1.45] lg:text-[30px]">
            从这里，找到你感兴趣的
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {PATH_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col rounded-[9px] border border-line bg-paper p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-brand/40"
              >
                <h3 className="text-[20px] font-semibold group-hover:text-brand">{card.title}</h3>
                <p className="mt-2 text-[12px] leading-[1.9] text-muted">{card.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      {/* 3. 精选内容 */}
      <section aria-labelledby="featured-title">
        <Container className="py-11 lg:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 id="featured-title" className="text-[25px] font-bold leading-[1.45] lg:text-[30px]">
              精选内容：从这里开始读
            </h2>
            <Link href="/articles" className="hidden shrink-0 text-[13px] font-semibold text-brand hover:underline hover:underline-offset-4 md:inline-flex">
              查看全部文章 <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
          {main ? (
            <div className="grid gap-10 rounded-[20px] border border-line bg-white p-6 lg:grid-cols-2 lg:p-10">
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
            <p className="rounded-[20px] border border-dashed border-line bg-white px-8 py-12 text-center text-[13px] text-muted">
              内容筹备中，第一批分享正在路上。
            </p>
          )}
        </Container>
      </section>

      {/* 4. 工具区（通栏背景） */}
      <section aria-labelledby="tools-title">
        <Container className="py-14 lg:py-20">
          <div className="grid gap-12 rounded-[20px] border border-line bg-soft-blue p-8 lg:grid-cols-2 lg:items-center lg:p-12">
          <div>
            <h2 id="tools-title" className="text-[25px] font-bold leading-[1.45] lg:text-[30px]">
              好工具，应该让你
              <br />
              更专注于创造。
            </h2>
            <p className="mt-4 max-w-[420px] text-[13px] leading-[2] text-[#3c485b]">
              不做简单的软件清单。只分享那些我真正用过，并且改变了工作方式的工具。
            </p>
            <Link href="/tools" className={`${buttonStyles()} mt-8`}>
              逛逛我的工具箱 <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {tools.length > 0 ? (
              tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group flex items-center gap-4 rounded-[10px] border border-line bg-white p-5 transition-colors hover:border-brand/40"
                >
                  <div className="min-w-0 flex-1">
                    <strong className="block text-[15px]">{tool.name}</strong>
                    <p className="mt-1 line-clamp-1 text-[12px] text-muted">{tool.summary}</p>
                  </div>
                  <span aria-hidden="true" className="text-[18px] text-brand transition-transform group-hover:translate-x-1">↗</span>
                </Link>
              ))
            ) : (
              <p className="rounded-[10px] border border-dashed border-line bg-white/60 p-5 text-[12px] text-muted">
                工具整理中，即将更新。
              </p>
            )}
          </div>
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
            <h2 id="creations-title" className="text-[25px] font-bold leading-[1.45] lg:text-[30px]">
              把经验沉淀下来，
              <br />
              也把价值分享出去。
            </h2>
            <p className="mt-4 max-w-[440px] text-[13px] leading-[2] text-muted">
              用最实用的产品创造更高的价值。
            </p>
            <Link href="/products" className={`${buttonStyles({ variant: 'secondary' })} mt-8`}>
              看看我的商品 <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* 6. 品牌格言区 */}
      <section className="py-[62px] text-center lg:py-[74px]">
        <Container>
          <p className="font-serif text-[20px] tracking-[0.3px] text-[#627089] lg:text-[26px]">
            “持续构建，真诚分享，让价值流动。”
          </p>
        </Container>
      </section>
    </main>
  );
}
