import toolsData from '@/data/tools.json';
import categoriesData from '@/data/categories.json';
import { Tool, Category, PaginatedResult } from '@/types';

const tools: Tool[] = toolsData as Tool[];
const categories: Category[] = categoriesData as Category[];

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
