'use client';

import { useState } from 'react';
import { Mail, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewsletterProps {
  variant?: 'inline' | 'card' | 'footer';
  className?: string;
}

export default function Newsletter({ variant = 'card', className = '' }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    // Simulate API call - Replace with actual newsletter service (Beehiiv, ConvertKit, etc.)
    // Example: await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });

    setTimeout(() => {
      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox for confirmation.');
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }, 1000);
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={status === 'loading' || status === 'success'}
        />
        <Button type="submit" disabled={status === 'loading' || status === 'success'}>
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            'Subscribe'
          )}
        </Button>
      </form>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <h3 className="font-semibold mb-2">Stay Updated</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Get weekly AI tool recommendations
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-9"
            disabled={status === 'loading' || status === 'success'}
          />
          <Button type="submit" size="sm" disabled={status === 'loading' || status === 'success'}>
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        </form>
        {message && (
          <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 p-8 ${className}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-primary">Weekly Newsletter</span>
        </div>

        <h3 className="text-2xl font-bold mb-2">
          Get the Latest AI Tools
        </h3>
        <p className="text-muted-foreground mb-6">
          Join 10,000+ subscribers. Get weekly curated AI tools, exclusive deals, and industry insights delivered to your inbox.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 px-4"
              disabled={status === 'loading'}
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Subscribe Free
                </>
              )}
            </Button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-500 text-sm mt-2">{message}</p>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          No spam, unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </div>
  );
}
