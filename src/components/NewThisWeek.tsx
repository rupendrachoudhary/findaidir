import Link from 'next/link';
import { ArrowRight, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ToolCard from '@/components/ToolCard';
import { getRecentTools, getNewToolsCount } from '@/lib/data';

interface NewThisWeekProps {
  count?: number;
}

export default function NewThisWeek({ count = 8 }: NewThisWeekProps) {
  const recentTools = getRecentTools(count);
  const newThisWeekCount = getNewToolsCount(7);

  if (recentTools.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-teal-500/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-3 border border-emerald-500/20">
              <Sparkles className="h-4 w-4" />
              <span>Fresh Additions</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">New This Week</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {newThisWeekCount > 0
                ? `${newThisWeekCount} new tools added recently`
                : 'Check out our latest additions'
              }
            </p>
          </div>
          <Button asChild variant="outline" className="border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/5">
            <Link href="/tools?sort=newest">
              View All New
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} showNewBadge />
          ))}
        </div>
      </div>
    </section>
  );
}
