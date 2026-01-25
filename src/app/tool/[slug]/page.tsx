import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Tag, Folder, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ToolCard from '@/components/ToolCard';
import ShareButton from '@/components/ShareButton';
import { getToolBySlug, getToolsByCategory, getAllTools } from '@/lib/data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return { title: 'Tool Not Found' };
  }

  return {
    title: tool.name,
    description: tool.description,
    openGraph: {
      title: `${tool.name} - AI Tools Directory`,
      description: tool.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.description,
    },
  };
}

export async function generateStaticParams() {
  const tools = getAllTools();
  return tools.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  // Get related tools from the same category
  const relatedTools = getToolsByCategory(tool.categorySlug)
    .filter((t) => t.id !== tool.id)
    .slice(0, 4);

  // Get initials for avatar
  const initials = tool.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

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

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: tool.website,
    applicationCategory: tool.category,
    operatingSystem: 'Web',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/tools">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Link>
          </Button>
        </div>

        {/* Tool Header */}
        <div className="max-w-4xl">
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Tool Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-2xl shrink-0 overflow-hidden ring-4 ring-primary/20 shadow-lg">
                  {faviconUrl ? (
                    <Image
                      src={faviconUrl}
                      alt={`${tool.name} logo`}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{initials}</span>
                  )}
                </div>

                {/* Tool Info */}
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{tool.name}</h1>

                  {/* Category */}
                  <Link href={`/category/${tool.categorySlug}`}>
                    <Badge variant="secondary" className="mb-4 gap-1">
                      <Folder className="h-3 w-3" />
                      {tool.category}
                    </Badge>
                  </Link>

                  {/* Description */}
                  <p className="text-muted-foreground text-lg mb-6">{tool.description}</p>

                  {/* Tags */}
                  {tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tool.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* CTA Button and Share */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all">
                      <a href={tool.website} target="_blank" rel="noopener noreferrer">
                        Visit Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>

                    <ShareButton
                      title={tool.name}
                      description={tool.description}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tool Details */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About {tool.name}</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground">{tool.description}</p>
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-3">Quick Info</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">Category</dt>
                      <dd className="font-medium">{tool.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Website</dt>
                      <dd>
                        <a
                          href={tool.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline break-all"
                        >
                          {tool.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      </dd>
                    </div>
                    {tool.dateAdded && (
                      <div>
                        <dt className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Added
                        </dt>
                        <dd className="font-medium">
                          {new Date(tool.dateAdded).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Similar Tools</h2>
              <Button asChild variant="outline">
                <Link href={`/category/${tool.categorySlug}`}>
                  View All in {tool.category}
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTools.map((relatedTool) => (
                <ToolCard key={relatedTool.id} tool={relatedTool} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
