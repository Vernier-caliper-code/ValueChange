import { Container } from '@/components/ui/container';
import { CardGridSkeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
  return (
    <main>
      <Container className="py-16">
        <CardGridSkeleton />
      </Container>
    </main>
  );
}
