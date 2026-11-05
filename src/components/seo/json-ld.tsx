export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // 内容来自服务端结构化数据，非用户输入
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
