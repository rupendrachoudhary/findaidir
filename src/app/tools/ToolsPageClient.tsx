'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ToolCard from '@/components/ToolCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { getAllTools, getAllCategories, sortTools, SortOption } from '@/lib/data';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Sparkles } from 'lucide-react';

// Check if a date is within the last N days
function isWithinDays(dateString: string | undefined, days: number): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

export default function ToolsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const categorySlug = searchParams.get('category') || '';
  const sort = (searchParams.get('sort') || 'popular') as SortOption;
  const newOnly = searchParams.get('new') === 'true';
  const pageSize = 24;

  const allTools = useMemo(() => getAllTools(), []);
  const categories = useMemo(() => getAllCategories(), []);

  // Filter tools based on search, category, and new filter
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

    // Filter to only new tools if enabled
    if (newOnly) {
      result = result.filter(tool => isWithinDays(tool.dateAdded, 7));
    }

    // Apply sorting
    result = sortTools(result, sort);

    return result;
  }, [allTools, query, categorySlug, newOnly, sort]);

  // Handle sort change
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page'); // Reset to page 1 when sorting
    router.push(`/tools/?${params.toString()}`);
  };

  // Toggle new filter
  const toggleNewFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (newOnly) {
      params.delete('new');
    } else {
      params.set('new', 'true');
    }
    params.delete('page'); // Reset to page 1
    router.push(`/tools/?${params.toString()}`);
  };

  // Paginate
  const total = filteredTools.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const tools = filteredTools.slice(start, start + pageSize);

  // Build search params for pagination
  const paginationParams: Record<string, string> = {};
  if (query) paginationParams.q = query;
  if (categorySlug) paginationParams.category = categorySlug;
  if (sort !== 'popular') paginationParams.sort = sort;
  if (newOnly) paginationParams.new = 'true';

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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchBar
            placeholder="Search AI tools..."
            className="max-w-xl w-full sm:w-auto"
            defaultValue={query}
          />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Popular</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {/* New This Week Filter */}
          <button onClick={toggleNewFilter}>
            <Badge
              variant={newOnly ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                newOnly
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-0'
                  : 'border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10'
              }`}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              New This Week
            </Badge>
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Category Filter Pills */}
          <Link href="/tools/">
            <Badge
              variant={!categorySlug ? 'default' : 'secondary'}
              className="cursor-pointer hover:bg-primary/80"
            >
              All
            </Badge>
          </Link>
          {categories.slice(0, 15).map((cat) => (
            <Link key={cat.slug} href={`/tools/?category=${cat.slug}${sort !== 'popular' ? `&sort=${sort}` : ''}${newOnly ? '&new=true' : ''}`}>
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
