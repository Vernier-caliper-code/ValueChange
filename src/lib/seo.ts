import type { Metadata } from 'next';

export const SITE_NAME = 'ValuePass';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const DEFAULT_OG_IMAGE = '/images/og-default.png';

/** 各页面统一构造 Metadata：title 模板在根布局，附 canonical 与 OG。 */
export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string | null;
  noIndex?: boolean;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: `${SITE_URL}${input.path}` },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${input.title}｜${SITE_NAME}`,
      description: input.description,
      url: `${SITE_URL}${input.path}`,
      siteName: SITE_NAME,
      images: [input.imageUrl ?? `${SITE_URL}${DEFAULT_OG_IMAGE}`],
    },
  };
}
