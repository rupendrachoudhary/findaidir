'use client';

import { useState } from 'react';
import { Share2, Twitter, Linkedin, Link, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  title: string;
  url?: string;
  description?: string;
}

export default function ShareButton({ title, url, description }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // Use current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = description || `Check out ${title} on Find AI Dir`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">
        <Share2 className="h-4 w-4 inline mr-1" />
        Share:
      </span>

      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleTwitterShare}
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleLinkedInShare}
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleCopyLink}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Link className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
