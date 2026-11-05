import type { MetadataRoute } from 'next';

import { getSitemapEntries } from '@/lib/data/sitemap';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

const STATIC_PATHS = ['/', '/articles', '/tools', '/insights', '/products', '/about'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemapEntries();
  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: new Date() })),
    ...entries.map((entry) => ({
      url: `${SITE_URL}${entry.path}`,
      lastModified: entry.updatedAt,
    })),
  ];
}
