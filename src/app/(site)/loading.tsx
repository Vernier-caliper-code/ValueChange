import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main>
      <Container className="py-20">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="mt-6 h-6 w-1/3" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </Container>
    </main>
  );
}
