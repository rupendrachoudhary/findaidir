import Link from 'next/link';
import { ArrowRight, Folder } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Generate consistent gradient based on category name
  const gradients = [
    'from-blue-500 to-purple-500',
    'from-purple-500 to-pink-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-violet-500 to-purple-500',
    'from-fuchsia-500 to-pink-500',
    'from-blue-600 to-cyan-500',
    'from-purple-600 to-indigo-500',
  ];

  const gradientIndex = category.name.length % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer hover:-translate-y-0.5 bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all`}>
            <Folder className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {category.count} tools
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
}
