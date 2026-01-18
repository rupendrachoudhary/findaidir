'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ToolCard from '@/components/ToolCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { getAllTools, getAllCategories } from '@/lib/data';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ToolsPageClient() {
  const searchParams = useSearchParams();

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const categorySlug = searchParams.get('category') || '';
  const pageSize = 24;

  const allTools = useMemo(() => getAllTools(), []);
  const categories = useMemo(() => getAllCategories(), []);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let result = allTools;

    if (categorySlug) {
      result = result.filter(tool => tool.categorySlug === categorySlug);
    }

    if (query) {
      const lowerQuery = query.toLowerCase().trim();
      result = result.filter(tool =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.category.toLowerCase().includes(lowerQuery) ||
        tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return result;
  }, [allTools, query, categorySlug]);

  // Paginate
  const total = filteredTools.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const tools = filteredTools.slice(start, start + pageSize);

  // Build search params for pagination
  const paginationParams: Record<string, string> = {};
  if (query) paginationParams.q = query;
  if (categorySlug) paginationParams.category = categorySlug;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="max-w-3xl mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {categorySlug ? `AI Tools` : 'Browse All AI Tools'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {query
            ? `Showing ${total} results for "${query}"`
            : categorySlug
            ? `Explore ${total} AI tools in this category`
            : `Discover ${total.toLocaleString()}+ AI tools across all categories`}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <SearchBar
          placeholder="Search AI tools..."
          className="max-w-xl"
          defaultValue={query}
        />

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Link href="/tools/">
            <Badge
              variant={!categorySlug ? 'default' : 'secondary'}
              className="cursor-pointer hover:bg-primary/80"
            >
              All
            </Badge>
          </Link>
          {categories.slice(0, 15).map((cat) => (
            <Link key={cat.slug} href={`/tools/?category=${cat.slug}`}>
              <Badge
                variant={categorySlug === cat.slug ? 'default' : 'secondary'}
                className="cursor-pointer hover:bg-primary/80"
              >
                {cat.name}
              </Badge>
            </Link>
          ))}
          <Link href="/categories/">
            <Badge variant="outline" className="cursor-pointer">
              View All Categories
            </Badge>
          </Link>
        </div>
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
            baseUrl="/tools/"
            searchParams={paginationParams}
          />
        </>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2">No tools found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Link href="/tools/" className="text-primary hover:underline">
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}
