'use client';

import { useEffect, useState } from 'react';

import type { Heading } from '@/lib/utils/markdown-text';

export function ArticleToc({ headings, onNavigate }: { headings: Heading[]; onNavigate?: () => void }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const elements = headings
      .map((_, index) => document.getElementById(`section-${index}`))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.id.replace('section-', ''));
            setActive(index);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="本文目录" className="flex flex-col">
      {headings.map((heading, index) => (
        <a
          key={index}
          href={`#section-${index}`}
          onClick={onNavigate}
          className={`border-l py-2 text-[12px] leading-[1.7] transition-colors ${
            heading.depth === 3 ? 'pl-8' : 'pl-4'
          } ${active === index ? 'border-brand text-brand' : 'border-line text-muted hover:text-ink'}`}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
