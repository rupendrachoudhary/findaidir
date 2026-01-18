'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FormData {
  toolName: string;
  websiteUrl: string;
  category: string;
  description: string;
  email: string;
  plan: string;
}

export default function SubmitToolForm() {
  const [formData, setFormData] = useState<FormData>({
    toolName: '',
    websiteUrl: '',
    category: '',
    description: '',
    email: '',
    plan: 'free',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const categories = [
    'AI Agents',
    'AI Chatbots',
    'AI Writing',
    'AI Image Generation',
    'AI Video',
    'AI Audio',
    'AI Coding',
    'AI Marketing',
    'AI Productivity',
    'AI Research',
    'AI Analytics',
    'AI Customer Support',
    'AI Education',
    'AI Finance',
    'AI Healthcare',
    'Other',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.toolName || !formData.websiteUrl || !formData.email || !formData.description) {
      setStatus('error');
      setMessage('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    // Simulate API call - Replace with actual form submission
    // Options: Formspree, Netlify Forms, custom API, or email service
    // Example with Formspree:
    // await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),
    // });

    setTimeout(() => {
      setStatus('success');
      setMessage('Thank you! Your tool has been submitted for review. We\'ll contact you within 48 hours.');
      setFormData({
        toolName: '',
        websiteUrl: '',
        category: '',
        description: '',
        email: '',
        plan: 'free',
      });
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">Submission Received!</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button onClick={() => setStatus('idle')} variant="outline">
          Submit Another Tool
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Select Plan <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { value: 'free', label: 'Free', price: '$0' },
            { value: 'express', label: 'Express', price: '$29' },
            { value: 'featured', label: 'Featured', price: '$99' },
            { value: 'sponsored', label: 'Sponsored', price: '$299/mo' },
          ].map((plan) => (
            <label
              key={plan.value}
              className={`relative flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                formData.plan === plan.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={plan.value}
                checked={formData.plan === plan.value}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="font-medium text-sm">{plan.label}</span>
              <span className="text-xs text-muted-foreground">{plan.price}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tool Name */}
      <div>
        <label htmlFor="toolName" className="block text-sm font-medium mb-2">
          Tool Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="toolName"
          name="toolName"
          type="text"
          placeholder="e.g., ChatGPT, Midjourney"
          value={formData.toolName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Website URL */}
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium mb-2">
          Website URL <span className="text-red-500">*</span>
        </label>
        <Input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          placeholder="https://yourtool.com"
          value={formData.websiteUrl}
          onChange={handleChange}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Describe what your AI tool does, its key features, and target audience..."
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Contact Email <span className="text-red-500">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          We&apos;ll send confirmation and updates to this email
        </p>
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
          {message}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Tool
          </>
        )}
      </Button>

      {/* Terms */}
      <p className="text-xs text-center text-muted-foreground">
        By submitting, you agree to our{' '}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}
