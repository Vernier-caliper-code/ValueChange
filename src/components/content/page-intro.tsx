import { Container } from '@/components/ui/container';

export function PageIntro({ title }: { title: string }) {
  return (
    <section className="border-b border-line">
      <Container className="pb-[43px] pt-[59px]">
        <h1 className="text-[31px] font-bold leading-[1.4] tracking-[-1.5px] lg:text-[43px]">{title}</h1>
      </Container>
    </section>
  );
}