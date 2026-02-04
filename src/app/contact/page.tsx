import { Metadata } from 'next';
import { Mail, MessageSquare, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Find AI Dir. We\'d love to hear from you about tool submissions, advertising, partnerships, or general inquiries.',
  alternates: {
    canonical: '/contact/',
  },
};

export default function ContactPage() {
  const contactOptions = [
    {
      icon: Mail,
      title: 'General Inquiries',
      description: 'Questions about our directory or services',
      email: 'hello@findaidir.com',
    },
    {
      icon: Send,
      title: 'Tool Submissions',
      description: 'Submit your AI tool for listing',
      email: 'submit@findaidir.com',
    },
    {
      icon: MessageSquare,
      title: 'Advertising',
      description: 'Sponsorship and advertising opportunities',
      email: 'advertise@findaidir.com',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Get in{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Touch
          </span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Have a question, suggestion, or want to partner with us? We&apos;d love to hear from you.
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
        {contactOptions.map((option) => (
          <a
            key={option.title}
            href={`mailto:${option.email}`}
            className="p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
              <option.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{option.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
            <span className="text-sm text-primary font-medium">{option.email}</span>
          </a>
        ))}
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border bg-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Send us a Message</h2>
              <p className="text-sm text-muted-foreground">We&apos;ll get back to you within 24-48 hours</p>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>

      {/* Response Time */}
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Average response time: 24-48 hours</span>
        </div>
      </div>
    </div>
  );
}
