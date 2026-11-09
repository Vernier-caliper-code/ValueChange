import { Container } from '@/components/ui/container';

/** 板块页头：紧凑极光氛围（矮区域用更淡的光斑），标题淡入。 */
export function PageIntro({ title }: { title: string }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-[rgba(239,246,255,0.6)] to-transparent">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="intro-blob intro-blob-a" />
        <div className="intro-blob intro-blob-b" />
      </div>
      <Container className="relative pb-[43px] pt-[59px]">
        <h1 className="hero-enter text-[31px] font-bold leading-[1.4] tracking-[-1.5px] lg:text-[43px]">{title}</h1>
      </Container>
    </section>
  );
}