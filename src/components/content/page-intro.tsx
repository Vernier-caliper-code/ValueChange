import { Container } from '@/components/ui/container';

export function PageIntro({
  eyebrow,
  title,
  description,
  footnote,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  footnote: string;
}) {
  return (
    <section className="border-b border-line">
      <Container className="pb-[43px] pt-[59px]">
        <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[1.8px] text-brand before:block before:h-px before:w-[22px] before:bg-current">
          {eyebrow}
        </p>
        <h1 className="mb-3.5 mt-4 text-[31px] font-bold leading-[1.4] tracking-[-1.5px] lg:text-[43px]">{title}</h1>
        <p className="max-w-[560px] text-[14px] leading-[1.9] text-muted">{description}</p>
        <div className="mt-5 font-mono text-[10px] tracking-[1px] text-[#9199a7]">{footnote}</div>
      </Container>
    </section>
  );
}
