declare global {
  interface Window {
    _hmt?: [string, ...string[]][];
  }
}

/** 百度统计自定义事件；脚本未加载时静默跳过。 */
export function trackEvent(category: 'Product' | 'Tool', action: string, label: string): void {
  if (typeof window === 'undefined') return;
  window._hmt?.push(['_trackEvent', category, action, label]);
}
