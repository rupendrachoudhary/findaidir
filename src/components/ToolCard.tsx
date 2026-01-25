'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, ArrowRight, Star, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tool } from '@/types';
import { useState } from 'react';

interface ToolCardProps {
  tool: Tool;
  showNewBadge?: boolean;
}

// Check if a date is within the last N days
function isWithinDays(dateString: string | undefined, days: number): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

export default function ToolCard({ tool, showNewBadge = false }: ToolCardProps) {
  const [imgError, setImgError] = useState(false);

  // Get icon based on category
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Extract domain for favicon
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  };

  const domain = getDomain(tool.website);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';

  // Use affiliate URL if available, otherwise use regular website URL
  const externalUrl = tool.affiliateUrl || tool.website;

  // Check if tool is new (added within last 7 days)
  const isNew = showNewBadge || isWithinDays(tool.dateAdded, 7);

  return (
    <Card className={`group h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80 relative ${tool.isSponsored ? 'ring-2 ring-primary/30' : ''} ${tool.isFeatured ? 'ring-2 ring-yellow-500/30' : ''} ${isNew && !tool.isSponsored && !tool.isFeatured ? 'ring-2 ring-emerald-500/30' : ''}`}>
      {/* Sponsored/Featured/New Badge */}
      {(tool.isSponsored || tool.isFeatured || isNew) && (
        <div className="absolute -top-2 -right-2 z-10">
          {tool.isSponsored ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
              <Sparkles className="h-3 w-3" />
              Sponsored
            </span>
          ) : tool.isFeatured ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
              <Star className="h-3 w-3" />
              Featured
            </span>
          ) : isNew ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg animate-pulse">
              <Zap className="h-3 w-3" />
              New
            </span>
          ) : null}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Tool Logo/Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
            {faviconUrl && !imgError ? (
              <Image
                src={faviconUrl}
                alt={`${tool.name} logo`}
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
                onError={() => setImgError(true)}
                unoptimized
              />
            ) : (
              <span className="gradient-text font-bold">{getInitials(tool.name)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/tool/${tool.slug}`}>
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {tool.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1.5">
              <Link href={`/category/${tool.categorySlug}`}>
                <Badge variant="secondary" className="text-xs bg-primary/15 text-primary font-medium hover:bg-primary/25 border-primary/30">
                  {tool.category}
                </Badge>
              </Link>
              {tool.pricing && (
                <Badge variant="outline" className="text-[10px] capitalize">
                  {tool.pricing}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {tool.description}
        </p>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover:shadow-lg transition-all">
          <Link href={`/tool/${tool.slug}`}>
            View Details
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5">
          <a href={externalUrl} target="_blank" rel={tool.affiliateUrl ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}>
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
