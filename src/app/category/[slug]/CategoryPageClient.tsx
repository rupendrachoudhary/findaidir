'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { getCategoryBySlug, getToolsByCategory } from '@/lib/data';

interface CategoryPageClientProps {
  slug: string;
}

export default function CategoryPageClient({ slug }: CategoryPageClientProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 24;

  const category = useMemo(() => getCategoryBySlug(slug), [slug]);
  const allCategoryTools = useMemo(() => getToolsByCategory(slug), [slug]);

  // Paginate
  const total = allCategoryTools.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const tools = allCategoryTools.slice(start, start + pageSize);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <CategoryLoadingSkeleton />;
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/categories/">
            <ArrowLeft className="h-4 w-4" />
            All Categories
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <div className="max-w-3xl mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{category.name}</h1>
        <p className="text-muted-foreground text-lg">
          Discover {total} AI tools in the {category.name} category
        </p>
      </div>

      {/* Tools Grid */}
      {tools.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/category/${slug}/`}
          />
        </>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2">No tools found</h3>
          <p className="text-muted-foreground">
            There are no tools in this category yet.
          </p>
        </div>
      )}
    </div>
  );
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
