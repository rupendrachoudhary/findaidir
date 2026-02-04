import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Target, Users, Zap, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTotalToolsCount, getTotalCategoriesCount } from '@/lib/data';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Find AI Dir - The largest AI tools directory helping users discover the perfect AI solutions for their needs.',
  alternates: {
    canonical: '/about/',
  },
};

export default function AboutPage() {
  const totalTools = getTotalToolsCount();
  const totalCategories = getTotalCategoriesCount();

  const values = [
    {
      icon: Target,
      title: 'Comprehensive',
      description: 'We strive to list every valuable AI tool available, making us your one-stop destination for AI discovery.',
    },
    {
      icon: Zap,
      title: 'Up-to-Date',
      description: 'The AI landscape evolves rapidly. We continuously update our directory to include the latest tools and innovations.',
    },
    {
      icon: Users,
      title: 'User-Focused',
      description: 'Our platform is designed with users in mind, making it easy to find, compare, and choose the right AI tools.',
    },
    {
      icon: Heart,
      title: 'Community-Driven',
      description: 'We welcome submissions from tool creators and feedback from users to improve our directory.',
    },
  ];

  const stats = [
    { value: `${totalTools.toLocaleString()}+`, label: 'AI Tools Listed' },
    { value: `${totalCategories}+`, label: 'Categories' },
    { value: '50K+', label: 'Monthly Visitors' },
    { value: '10K+', label: 'Newsletter Subscribers' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-sm font-medium mb-6 border border-primary/20">
          <Sparkles className="h-4 w-4" />
          <span>About Find AI Dir</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Helping You Discover the{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Best AI Tools
          </span>
        </h1>

        <p className="text-xl text-muted-foreground">
          Find AI Dir is the largest and most comprehensive directory of artificial intelligence tools,
          helping individuals and businesses discover the perfect AI solutions for their needs.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Our Story */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Our Story</h2>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-lg">
            Find AI Dir was born from a simple observation: the AI tool landscape is exploding with innovation,
            but finding the right tool for your specific needs has become increasingly challenging.
          </p>
          <p className="text-muted-foreground text-lg mt-4">
            With thousands of AI tools launching every year—from writing assistants and image generators to
            coding copilots and marketing automation—we saw the need for a comprehensive, well-organized
            directory that helps users cut through the noise.
          </p>
          <p className="text-muted-foreground text-lg mt-4">
            Our mission is simple: to be the most complete and user-friendly resource for discovering AI tools.
            Whether you&apos;re a developer looking for coding assistants, a marketer seeking content generation tools,
            or a business owner exploring automation solutions, we&apos;re here to help you find exactly what you need.
          </p>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {values.map((value) => (
            <div key={value.title} className="p-6 rounded-xl border bg-card">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What We Offer */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">What We Offer</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Free Directory Access</h3>
            <p className="text-sm text-muted-foreground">
              Browse our entire collection of {totalTools.toLocaleString()}+ AI tools across {totalCategories}+ categories,
              completely free. Search, filter, and discover tools that match your needs.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Tool Submissions</h3>
            <p className="text-sm text-muted-foreground">
              AI tool creators can submit their tools for listing. We offer free listings as well as
              premium options for enhanced visibility and featured placements.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Weekly Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Stay updated with the latest AI tools, industry news, and exclusive insights delivered
              straight to your inbox every week.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Advertising Opportunities</h3>
            <p className="text-sm text-muted-foreground">
              Reach our engaged audience of AI enthusiasts, developers, and businesses through
              sponsored listings and advertising partnerships.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="text-muted-foreground mb-6">
          Whether you&apos;re looking for AI tools or want to showcase your own, we&apos;re here to help.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary">
            <Link href="/tools">
              Explore Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/submit">
              Submit Your Tool
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
