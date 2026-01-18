import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Folder } from 'lucide-react';
import { getAllCategories } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'AI Tool Categories',
  description: 'Browse AI tools by category. Explore 290+ categories including chatbots, image generators, writing assistants, and more.',
};

export default function CategoriesPage() {
  const categories = getAllCategories();

  // Group categories by first letter
  const grouped = categories.reduce((acc, cat) => {
    const firstChar = cat.name[0].toUpperCase();
    const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
    if (!acc[key]) acc[key] = [];
    acc[key].push(cat);
    return acc;
  }, {} as Record<string, typeof categories>);

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          AI Tool Categories
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse through {categories.length}+ categories to find the perfect AI tool for your needs.
        </p>
      </div>

      {/* Popular Categories */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 12).map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`}>
              <Card className="group h-full hover:shadow-md transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Folder className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.count} tools
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* All Categories A-Z */}
      <section>
        <h2 className="text-2xl font-bold mb-6">All Categories</h2>
        <div className="space-y-8">
          {sortedKeys.map((letter) => (
            <div key={letter}>
              <h3 className="text-lg font-semibold text-primary mb-4 sticky top-16 bg-background py-2 z-10 border-b">
                {letter}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {grouped[letter].map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <span className="text-sm group-hover:text-primary transition-colors line-clamp-1">
                      {category.name}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded shrink-0 ml-2">
                      {category.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
