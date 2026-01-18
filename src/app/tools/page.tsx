import { Suspense } from 'react';
import ToolsPageClient from './ToolsPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse All AI Tools',
  description: 'Explore our complete directory of 6000+ AI tools. Search and filter to find the perfect AI solution for your needs.',
};

function ToolsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-10 w-64 bg-muted rounded mb-4 animate-pulse" />
      <div className="h-6 w-96 bg-muted rounded mb-8 animate-pulse" />
      <div className="h-12 w-full max-w-xl bg-muted rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<ToolsLoadingSkeleton />}>
      <ToolsPageClient />
    </Suspense>
  );
}
