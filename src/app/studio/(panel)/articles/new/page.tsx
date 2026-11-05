import { ArticleEditor } from '@/components/forms/article-editor';

export default function NewArticlePage() {
  return (
    <div>
      <h2 className="mb-6 text-[20px] font-bold">写一篇新文章</h2>
      <ArticleEditor />
    </div>
  );
}
