import { ArticleListItem } from '@/components/content/article-list-item';
import { PageIntro } from '@/components/content/page-intro';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import type { PublicArticle } from '@/lib/data/articles';

export function ArticleListView({
  articles,
  basePath,
  title,
}: {
  articles: PublicArticle[];
  basePath: '/articles' | '/insights';
  title: string;
}) {
  return (
    <>
      <PageIntro title={title} />
      <Container className="pb-[76px] pt-3">
        {articles.length > 0 ? (
          <section aria-label={`${title}列表`}>
            {articles.map((article) => (
              <ArticleListItem key={article.id} article={article} basePath={basePath} />
            ))}
          </section>
        ) : (
          <div className="pt-8">
            <EmptyState
              title="内容筹备中"
              description="这里很快会有新的分享。先去看看已经发布的其他内容吧。"
              actionHref="/"
              actionLabel="回到首页"
            />
          </div>
        )}
      </Container>
    </>
  );
}