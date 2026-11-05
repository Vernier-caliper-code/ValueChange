const formatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 数据库 UTC 时间 → Asia/Shanghai 的 YYYY.MM.DD。 */
export function formatDate(date: Date): string {
  return formatter.format(date).replace(/\//g, '.');
}
