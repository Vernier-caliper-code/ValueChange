'use client';

import { usePathname } from 'next/navigation';

/** 路由切换时重放一次入场动画（淡入+轻微上浮），让页面切换不生硬。 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter flex-1">
      {children}
    </div>
  );
}