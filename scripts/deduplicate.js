/**
 * Tool Deduplication Helper
 * Prevents duplicate entries by checking name and URL
 */

const fs = require('fs');
const path = require('path');

/**
 * Normalize a URL for comparison
 */
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    // Remove www, trailing slash, and protocol
    return parsed.hostname.replace(/^www\./, '') + parsed.pathname.replace(/\/$/, '');
  } catch {
    return url.toLowerCase().trim();
  }
}

/**
 * Normalize a name for comparison
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Load existing tools and create lookup sets
 */
function loadExistingTools() {
  const toolsPath = path.join(__dirname, '../src/data/tools.json');
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));

  const nameSet = new Set();
  const urlSet = new Set();

  for (const tool of tools) {
    nameSet.add(normalizeName(tool.name));
    if (tool.website) {
      urlSet.add(normalizeUrl(tool.website));
    }
  }

  return { tools, nameSet, urlSet };
}

/**
 * Check if a tool already exists
 */
function isDuplicate(tool, existingNames, existingUrls) {
  const normalizedName = normalizeName(tool.name);
  const normalizedUrl = tool.website ? normalizeUrl(tool.website) : null;

  if (existingNames.has(normalizedName)) {
    return { duplicate: true, reason: 'name' };
  }

  if (normalizedUrl && existingUrls.has(normalizedUrl)) {
    return { duplicate: true, reason: 'url' };
  }

  return { duplicate: false };
}

/**
 * Filter out duplicates from discovered tools
 */
function filterDuplicates(discoveredTools) {
  const { nameSet, urlSet } = loadExistingTools();
  const unique = [];
  const duplicates = [];

  // Also track within the discovered batch
  const batchNames = new Set();
  const batchUrls = new Set();

  for (const tool of discoveredTools) {
    const normalizedName = normalizeName(tool.name);
    const normalizedUrl = tool.website ? normalizeUrl(tool.website) : null;

    // Check against existing tools
    const existingCheck = isDuplicate(tool, nameSet, urlSet);
    if (existingCheck.duplicate) {
      duplicates.push({ ...tool, duplicateReason: `existing:${existingCheck.reason}` });
      continue;
    }

    // Check against batch
    if (batchNames.has(normalizedName)) {
      duplicates.push({ ...tool, duplicateReason: 'batch:name' });
      continue;
    }
    if (normalizedUrl && batchUrls.has(normalizedUrl)) {
      duplicates.push({ ...tool, duplicateReason: 'batch:url' });
      continue;
    }

    // Add to unique list and batch sets
    unique.push(tool);
    batchNames.add(normalizedName);
    if (normalizedUrl) {
      batchUrls.add(normalizedUrl);
    }
  }

  return { unique, duplicates };
}

/**
 * Add new tools to the tools.json file
 */
function addNewTools(newTools) {
  const toolsPath = path.join(__dirname, '../src/data/tools.json');
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));

  const today = new Date().toISOString().split('T')[0];
  let maxId = Math.max(...tools.map(t => t.id));

  // Helper to create slug
  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Add each new tool
  for (const tool of newTools) {
    maxId++;
    tools.push({
      id: maxId,
      name: tool.name,
      slug: slugify(tool.name),
      category: tool.category || 'productivity',
      categorySlug: slugify(tool.category || 'productivity'),
      tags: Array.isArray(tool.tags) ? tool.tags : (tool.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      description: tool.description || '',
      website: tool.website || '',
      dateAdded: today,
    });
  }

  // Write back
  fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));

  // Update categories
  updateCategories(tools);

  // Update metadata
  updateMetadata(tools);

  return tools.length;
}

/**
 * Regenerate categories.json
 */
function updateCategories(tools) {
  const categoryMap = new Map();

  for (const tool of tools) {
    const key = tool.category;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        name: tool.category,
        slug: tool.categorySlug,
        count: 0,
      });
    }
    categoryMap.get(key).count++;
  }

  const categories = Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  const categoriesPath = path.join(__dirname, '../src/data/categories.json');
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
}

/**
 * Update metadata.json
 */
function updateMetadata(tools) {
  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const newThisWeek = tools.filter(t => t.dateAdded && t.dateAdded >= oneWeekAgo).length;

  const metadata = {
    lastUpdated: new Date().toISOString(),
    toolCount: tools.length,
    newThisWeek: newThisWeek,
  };

  const metadataPath = path.join(__dirname, '../src/data/metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

module.exports = {
  normalizeUrl,
  normalizeName,
  loadExistingTools,
  isDuplicate,
  filterDuplicates,
  addNewTools,
  updateCategories,
  updateMetadata,
};
