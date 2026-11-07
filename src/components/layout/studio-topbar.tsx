import { requireStudioAdmin } from '@/lib/auth/studio';

export async function StudioTopbar({ title }: { title: string }) {
  const user = await requireStudioAdmin();
  return (
    <header className="flex h-[76px] items-center justify-between border-b border-line bg-white pl-16 pr-6 lg:h-[92px] lg:pl-6">
      <h1 className="text-[20px] font-bold lg:text-[24px]">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-muted">{user?.username} · 管理员</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
          {user?.username?.[0]?.toUpperCase() ?? 'V'}
        </div>
      </div>
    </header>
  );
}
