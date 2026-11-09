'use client';

import { useEffect, useRef } from 'react';

/** Hero 氛围层：缓慢漂移的极光光斑 + 鼠标微弱视差。纯装饰，对可访问性隐藏。 */
export function HeroAmbient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const hero = el?.parentElement;
    if (!el || !hero) return;
    // 触屏设备无悬停、减弱动效用户：不做鼠标跟随
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = el;
    const host = hero;
    let raf = 0;
    function onMove(event: MouseEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = host.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        container.style.setProperty('--mx', x.toFixed(3));
        container.style.setProperty('--my', y.toFixed(3));
      });
    }
    hero.addEventListener('mousemove', onMove);
    return () => {
      hero.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="ambient-parallax ambient-parallax-a">
        <div className="ambient-blob ambient-blob-a" />
      </div>
      <div className="ambient-parallax ambient-parallax-b">
        <div className="ambient-blob ambient-blob-b" />
      </div>
      <div className="ambient-parallax ambient-parallax-a">
        <div className="ambient-blob ambient-blob-c" />
      </div>
    </div>
  );
}