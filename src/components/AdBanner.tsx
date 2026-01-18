'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

// Google AdSense Banner Component
// Replace 'ca-pub-XXXXXXXXXXXXXXXX' with your actual AdSense publisher ID
export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && adRef.current) {
      try {
        // Push the ad
        // @ts-expect-error - adsbygoogle is defined by Google AdSense script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Placeholder Ad for development/testing
interface AdPlaceholderProps {
  size?: 'banner' | 'rectangle' | 'leaderboard' | 'skyscraper';
  className?: string;
  label?: string;
}

export function AdPlaceholder({ size = 'banner', className = '', label }: AdPlaceholderProps) {
  const sizeClasses = {
    banner: 'h-[90px] max-w-[728px]',
    rectangle: 'h-[250px] max-w-[300px]',
    leaderboard: 'h-[90px] w-full',
    skyscraper: 'h-[600px] w-[160px]',
  };

  return (
    <div
      className={`bg-gradient-to-r from-muted/50 to-muted flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 ${sizeClasses[size]} ${className}`}
    >
      <div className="text-center text-muted-foreground">
        <p className="text-xs font-medium">{label || 'Advertisement'}</p>
        <p className="text-xs opacity-60">Your Ad Here</p>
      </div>
    </div>
  );
}

// Sponsored Content Box
interface SponsoredBoxProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SponsoredBox({ title = 'Sponsored', children, className = '' }: SponsoredBoxProps) {
  return (
    <div className={`rounded-xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// Native Ad Card (looks like content but marked as sponsored)
interface NativeAdProps {
  title: string;
  description: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl: string;
  className?: string;
}

export function NativeAd({ title, description, imageUrl, ctaText = 'Learn More', ctaUrl, className = '' }: NativeAdProps) {
  return (
    <a
      href={ctaUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block rounded-xl border bg-card p-4 hover:shadow-lg transition-all group ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-2 py-0.5 bg-muted rounded">
          Sponsored
        </span>
      </div>
      <div className="flex gap-4">
        {imageUrl && (
          <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>
          <span className="text-xs text-primary font-medium mt-2 inline-block">
            {ctaText} →
          </span>
        </div>
      </div>
    </a>
  );
}
