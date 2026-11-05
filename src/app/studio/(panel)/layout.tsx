import { redirect } from 'next/navigation';

import { requireStudioAdmin } from '@/lib/auth/studio';
import { StudioSidebar } from '@/components/layout/studio-sidebar';
import { StudioTopbar } from '@/components/layout/studio-topbar';

export default async function StudioPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudioAdmin();
  if (!user) redirect('/studio');

  return (
    <div className="min-h-screen bg-paper">
      <StudioSidebar />
      <div className="lg:pl-[240px]">
        <StudioTopbar title="内容管理" />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
