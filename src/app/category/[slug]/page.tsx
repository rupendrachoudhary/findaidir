import { Suspense } from 'react';
import { getAllCategories } from '@/lib/data';
import CategoryPageClient from './CategoryPageClient';

// Generate static paths for all categories
export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

// Generate metadata for each category
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { getCategoryBySlug } = await import('@/lib/data');
  const category = getCategoryBySlug(slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${category.name} - AI Tools`,
    description: `Discover ${category.count} AI tools in the ${category.name} category. Find the best AI solutions for your needs.`,
    alternates: {
      canonical: `/category/${category.slug}/`,
    },
    openGraph: {
      title: `${category.name} - AI Tools Directory`,
      description: `Explore ${category.count} AI tools in the ${category.name} category.`,
    },
  };
}

function CategoryLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-32 bg-muted rounded mb-6 animate-pulse" />
      <div className="h-10 w-64 bg-muted rounded mb-4 animate-pulse" />
      <div className="h-6 w-96 bg-muted rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<CategoryLoadingSkeleton />}>
      <CategoryPageClient slug={slug} />
    </Suspense>
  );
}
