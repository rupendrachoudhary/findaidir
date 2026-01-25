import toolsData from '@/data/tools.json';
import categoriesData from '@/data/categories.json';
import metadataData from '@/data/metadata.json';
import { Tool, Category, PaginatedResult } from '@/types';

const tools: Tool[] = toolsData as Tool[];
const categories: Category[] = categoriesData as Category[];

export interface SiteMetadata {
  lastUpdated: string;
  toolCount: number;
  newThisWeek: number;
}

const metadata: SiteMetadata = metadataData as SiteMetadata;

export function getAllTools(): Tool[] {
  return tools;
}

export function getAllCategories(): Category[] {
  return categories;
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find(tool => tool.slug === slug);
}

export function getToolsByCategory(categorySlug: string): Tool[] {
  return tools.filter(tool => tool.categorySlug === categorySlug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(cat => cat.slug === slug);
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return tools;

  return tools.filter(tool =>
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.category.toLowerCase().includes(lowerQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getToolsPaginated(
  page: number = 1,
  pageSize: number = 24,
  categorySlug?: string,
  searchQuery?: string
): PaginatedResult<Tool> {
  let filteredTools = tools;

  if (categorySlug) {
    filteredTools = filteredTools.filter(tool => tool.categorySlug === categorySlug);
  }

  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase().trim();
    filteredTools = filteredTools.filter(tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.category.toLowerCase().includes(lowerQuery) ||
      tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  const total = filteredTools.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const items = filteredTools.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages
  };
}

export function getFeaturedTools(count: number = 12): Tool[] {
  // Get a mix of tools from popular categories
  const popularCategories = categories.slice(0, 10);
  const featured: Tool[] = [];

  for (const cat of popularCategories) {
    const categoryTools = tools.filter(t => t.categorySlug === cat.slug);
    if (categoryTools.length > 0) {
      featured.push(categoryTools[0]);
    }
    if (featured.length >= count) break;
  }

  return featured.slice(0, count);
}

export function getPopularCategories(count: number = 12): Category[] {
  return categories.slice(0, count);
}

export function getTotalToolsCount(): number {
  return tools.length;
}

export function getTotalCategoriesCount(): number {
  return categories.length;
}

// New functions for "New This Week" and sorting

export function getMetadata(): SiteMetadata {
  return metadata;
}

/**
 * Check if a date is within the last N days
 */
export function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

/**
 * Get tools added within the last N days
 */
export function getNewTools(days: number = 7): Tool[] {
  return tools
    .filter(tool => tool.dateAdded && isWithinDays(tool.dateAdded, days))
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
}

/**
 * Get the most recently added tools
 */
export function getRecentTools(count: number = 8): Tool[] {
  return [...tools]
    .sort((a, b) => {
      const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
      const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, count);
}

/**
 * Sort tools by various criteria
 */
export type SortOption = 'newest' | 'oldest' | 'az' | 'za' | 'popular';

export function sortTools(toolsList: Tool[], sortBy: SortOption): Tool[] {
  const sorted = [...toolsList];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateB - dateA;
      });
    case 'oldest':
      return sorted.sort((a, b) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateA - dateB;
      });
    case 'az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'za':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'popular':
    default:
      // Keep original order (which is by popularity/featured)
      return sorted;
  }
}

/**
 * Get count of new tools this week
 */
export function getNewToolsCount(days: number = 7): number {
  return getNewTools(days).length;
}
