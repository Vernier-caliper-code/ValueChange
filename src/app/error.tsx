'use client';

import { Container } from '@/components/ui/container';
import { buttonStyles } from '@/components/ui/button';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main">
      <Container className="flex flex-col items-center py-24 text-center lg:py-32">
        <h1 className="text-[22px] font-bold lg:text-[28px]">服务暂时不可用</h1>
        <p className="mt-4 text-[14px] leading-[2] text-muted">
          页面加载遇到了一点问题，请稍后重试。
        </p>
        <button type="button" onClick={reset} className={`${buttonStyles({ variant: 'secondary' })} mt-8`}>
          重新加载
        </button>
      </Container>
    </main>
  );
}
