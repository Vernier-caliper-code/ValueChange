'use client';

import { buttonStyles } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

export function ToolWebsiteLink({ url, name, slug }: { url: string; name: string; slug: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('Tool', 'visit_website', slug)}
      className={buttonStyles()}
    >
      前往 {name} 官网 <span aria-hidden="true">↗</span>
    </a>
  );
}
