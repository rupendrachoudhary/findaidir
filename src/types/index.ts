export interface Tool {
  id: number;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  tags: string[];
  description: string;
  website: string;
  dateAdded: string; // ISO date: "2025-01-25"
  // Monetization fields (optional)
  isSponsored?: boolean;
  isFeatured?: boolean;
  affiliateUrl?: string;
  pricing?: 'free' | 'freemium' | 'paid' | 'enterprise';
}

export interface Category {
  name: string;
  slug: string;
  count: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
