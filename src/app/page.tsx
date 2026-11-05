import { Container } from '@/components/ui/container';

export default function HomePage() {
  return (
    <main>
      <Container className="py-20">
        <h1 className="text-[37px] font-bold leading-[1.3] lg:text-[62px]">
          让想法，长成有价值的产品
        </h1>
        <p className="mt-6 max-w-[640px] text-[14px] leading-[1.9] text-muted lg:text-[15px]">
          ValuePass 正在搭建中：AI 全栈实战、AI 工具、经验分享与作品展示即将上线。
        </p>
      </Container>
    </main>
  );
}
