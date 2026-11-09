import { PageTransition } from '@/components/layout/page-transition';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </div>
  );
}