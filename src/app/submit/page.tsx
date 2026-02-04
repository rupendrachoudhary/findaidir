import { Metadata } from 'next';
import SubmitToolForm from '@/components/SubmitToolForm';
import { Check, Zap, Star, Rocket } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Submit Your AI Tool',
  description: 'Get your AI tool listed in our directory of 6000+ AI tools. Reach thousands of potential users looking for AI solutions.',
  alternates: {
    canonical: '/submit/',
  },
};

export default function SubmitPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      description: 'Basic listing for new tools',
      features: [
        'Standard listing in directory',
        'Category placement',
        'Basic tool description',
        '30-day review time',
      ],
      highlight: false,
      badge: null,
    },
    {
      name: 'Express',
      price: '$29',
      period: 'one-time',
      description: 'Fast-track your listing',
      features: [
        'Everything in Free',
        '48-hour review & approval',
        'Priority support',
        'Social media mention',
      ],
      highlight: false,
      badge: null,
    },
    {
      name: 'Featured',
      price: '$99',
      period: 'one-time',
      description: 'Maximum visibility',
      features: [
        'Everything in Express',
        '24-hour review & approval',
        '30-day homepage feature',
        'Category top placement',
        '"Featured" badge',
        'Newsletter inclusion',
      ],
      highlight: true,
      badge: 'Most Popular',
    },
    {
      name: 'Sponsored',
      price: '$299',
      period: '/month',
      description: 'Premium ongoing promotion',
      features: [
        'Everything in Featured',
        'Permanent top placement',
        'Dedicated tool page banner',
        'Monthly newsletter feature',
        'Social media promotion',
        'Analytics dashboard',
      ],
      highlight: false,
      badge: 'Best Value',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-sm font-medium mb-6 border border-primary/20">
          <Rocket className="h-4 w-4" />
          <span>Grow Your AI Tool</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Submit Your{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            AI Tool
          </span>
        </h1>

        <p className="text-xl text-muted-foreground">
          Get discovered by thousands of users actively searching for AI solutions.
          Join 6,000+ tools in the largest AI directory.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
        {[
          { value: '50K+', label: 'Monthly Visitors' },
          { value: '6,000+', label: 'Listed Tools' },
          { value: '290+', label: 'Categories' },
          { value: '10K+', label: 'Newsletter Subscribers' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pricing Plans */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Choose Your Listing Plan
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Select the plan that best fits your needs. All plans include permanent listing in our directory.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.highlight
                  ? 'border-primary bg-gradient-to-b from-primary/10 to-transparent shadow-lg scale-105'
                  : 'border-border bg-card'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary to-secondary text-white">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#submit-form"
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-center transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Select {plan.name}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Form */}
      <div id="submit-form" className="max-w-2xl mx-auto scroll-mt-8">
        <div className="rounded-2xl border bg-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Submit Your Tool</h2>
              <p className="text-sm text-muted-foreground">Fill out the form below to get started</p>
            </div>
          </div>

          <SubmitToolForm />
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground mb-4">Trusted by leading AI companies</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-50">
          {['OpenAI', 'Anthropic', 'Google AI', 'Microsoft', 'Meta AI'].map((company) => (
            <span key={company} className="text-lg font-semibold">
              {company}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
