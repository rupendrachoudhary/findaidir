import { Metadata } from 'next';
import Link from 'next/link';
import { Check, TrendingUp, Users, Eye, Target, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Advertise With Us',
  description: 'Reach thousands of AI enthusiasts, developers, and businesses. Advertise your AI tool or service on Find AI Dir.',
};

export default function AdvertisePage() {
  const stats = [
    { icon: Eye, value: '50K+', label: 'Monthly Page Views' },
    { icon: Users, value: '25K+', label: 'Monthly Visitors' },
    { icon: Target, value: '6,000+', label: 'Listed AI Tools' },
    { icon: TrendingUp, value: '40%', label: 'Month-over-Month Growth' },
  ];

  const advertisingOptions = [
    {
      name: 'Sponsored Listing',
      price: '$99',
      period: 'one-time',
      description: 'Get your tool featured prominently',
      features: [
        '30-day featured placement',
        '"Sponsored" badge on tool card',
        'Top position in category',
        'Homepage feature (7 days)',
        'Priority in search results',
      ],
      popular: false,
    },
    {
      name: 'Premium Sponsor',
      price: '$299',
      period: '/month',
      description: 'Maximum visibility and engagement',
      features: [
        'Everything in Sponsored Listing',
        'Permanent top placement',
        'Homepage banner ad',
        'Newsletter feature (weekly)',
        'Dedicated landing page',
        'Analytics dashboard',
        'Social media promotion',
      ],
      popular: true,
    },
    {
      name: 'Banner Advertising',
      price: '$499',
      period: '/month',
      description: 'High-impact display advertising',
      features: [
        'Homepage banner (728x90)',
        'Category page banners',
        'Tool page sidebar ads',
        '100K+ monthly impressions',
        'A/B testing support',
        'Detailed analytics',
        'Priority support',
      ],
      popular: false,
    },
  ];

  const benefits = [
    {
      title: 'Targeted Audience',
      description: 'Reach users actively searching for AI tools and solutions.',
    },
    {
      title: 'High Intent Traffic',
      description: 'Our visitors are decision-makers looking to adopt AI tools.',
    },
    {
      title: 'Quality Leads',
      description: 'Generate qualified leads from engaged AI enthusiasts.',
    },
    {
      title: 'Brand Visibility',
      description: 'Position your brand alongside top AI tools in the industry.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Advertise on{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Find AI Dir
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Reach thousands of AI enthusiasts, developers, and businesses actively looking for AI solutions.
        </p>
        <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary">
          <a href="mailto:advertise@findaidir.com">
            <Mail className="mr-2 h-4 w-4" />
            Contact Us to Advertise
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-6 rounded-xl bg-muted/50 border">
            <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Advertising Options */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Advertising Options</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Choose the advertising package that fits your goals and budget.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {advertisingOptions.map((option) => (
            <div
              key={option.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                option.popular
                  ? 'border-primary bg-gradient-to-b from-primary/10 to-transparent shadow-lg'
                  : 'border-border bg-card'
              }`}
            >
              {option.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary to-secondary text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold">{option.name}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold">{option.price}</span>
                <span className="text-muted-foreground text-sm">{option.period}</span>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={
                  option.popular
                    ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                    : ''
                }
                variant={option.popular ? 'default' : 'outline'}
              >
                <a href="mailto:advertise@findaidir.com?subject=Advertising Inquiry - {option.name}">
                  Get Started
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why Advertise With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="p-6 rounded-xl border bg-card">
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6">
          Contact us today to discuss your advertising goals and find the perfect solution for your brand.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary">
            <a href="mailto:advertise@findaidir.com">
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/submit">
              Submit Your Tool
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
