export const NAV_LINKS = [
  { label: '首页', href: '/' },
  { label: 'AI全栈', href: '/articles' },
  { label: 'AI工具', href: '/tools' },
  { label: '经验分享', href: '/insights' },
  { label: '商品', href: '/products' },
  { label: '关于我', href: '/about' },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}
