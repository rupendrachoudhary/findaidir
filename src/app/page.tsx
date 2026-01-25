import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Search as SearchIcon, Layers, Rocket, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import ToolCard from '@/components/ToolCard';
import CategoryCard from '@/components/CategoryCard';
import Newsletter from '@/components/Newsletter';
import NewThisWeek from '@/components/NewThisWeek';
import {
  getFeaturedTools,
  getPopularCategories,
  getTotalToolsCount,
  getTotalCategoriesCount,
  getMetadata,
  getNewToolsCount
} from '@/lib/data';

// Format relative time for "last updated"
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default function HomePage() {
  const featuredTools = getFeaturedTools(12);
  const popularCategories = getPopularCategories(12);
  const totalTools = getTotalToolsCount();
  const totalCategories = getTotalCategoriesCount();
  const metadata = getMetadata();
  const newThisWeek = getNewToolsCount(7);
  const lastUpdatedText = getRelativeTime(metadata.lastUpdated);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-secondary/10 to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span>Discover the Best AI Tools</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find the Perfect{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI Tool
              </span>{' '}
              for Your Needs
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore our comprehensive directory of {totalTools.toLocaleString()}+ AI tools across{' '}
              {totalCategories}+ categories. From chatbots to image generators, find the perfect solution.
            </p>

            {/* Search Bar */}
            <SearchBar
              placeholder="Search AI tools by name, category, or description..."
              className="max-w-2xl mx-auto mb-8"
              size="lg"
            />

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all">
                <Link href="/tools">
                  Browse All Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary/30 hover:border-primary hover:bg-primary/5">
                <Link href="/categories">
                  Explore Categories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{totalTools.toLocaleString()}+</span>
              </div>
              <p className="text-sm text-muted-foreground">AI Tools</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-accent">
                  <Layers className="h-4 w-4 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">{totalCategories}+</span>
              </div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                  <SearchIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Free</span>
              </div>
              <p className="text-sm text-muted-foreground">To Search</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">{newThisWeek > 0 ? newThisWeek : 'Fresh'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{newThisWeek > 0 ? 'New This Week' : 'Updates'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* New This Week */}
      <NewThisWeek count={8} />

      {/* Popular Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Popular Categories</h2>
              <p className="text-muted-foreground">Browse AI tools by category</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/categories">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularCategories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured AI Tools</h2>
              <p className="text-muted-foreground">Discover top-rated AI tools from various categories</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/tools">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Newsletter className="max-w-3xl mx-auto" />
        </div>
      </section>

      {/* Submit Tool CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
              <Rocket className="h-4 w-4" />
              <span>For AI Tool Makers</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Have an AI Tool? Get It Listed!
            </h2>
            <p className="text-muted-foreground mb-8">
              Reach thousands of potential users actively searching for AI solutions.
              Submit your tool and get discovered today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Link href="/submit">
                  Submit Your Tool
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/advertise">
                  Advertise With Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
