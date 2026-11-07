import { Container } from '@/components/ui/container';
import { ArticleListSkeleton } from '@/components/ui/skeleton';

export default function ArticlesLoading() {
  return (
    <main>
      <Container className="py-16">
        <ArticleListSkeleton />
      </Container>
    </main>
  );
}
