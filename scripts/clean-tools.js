/**
 * Clean tools data:
 * - Deduplicate by normalized website URL
 * - Ensure valid, unique slugs
 * - Refresh categories and metadata
 */

const fs = require('fs');
const path = require('path');
const { normalizeUrl, updateCategories, updateMetadata } = require('./deduplicate');

const toolsPath = path.join(__dirname, '../src/data/tools.json');

function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function mergeTool(target, incoming) {
  const targetDesc = (target.description || '').trim();
  const incomingDesc = (incoming.description || '').trim();
  if (incomingDesc.length > targetDesc.length) {
    target.description = incoming.description;
  }

  const targetTags = Array.isArray(target.tags) ? target.tags : [];
  const incomingTags = Array.isArray(incoming.tags) ? incoming.tags : [];
  const mergedTags = Array.from(new Set([...targetTags, ...incomingTags])).filter(Boolean);
  if (mergedTags.length) {
    target.tags = mergedTags;
  }

  if (!target.dateAdded && incoming.dateAdded) {
    target.dateAdded = incoming.dateAdded;
  }
}

function cleanTools() {
  const raw = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));

  const byUrl = new Map();
  const cleaned = [];

  for (const tool of raw) {
    const normUrl = tool.website ? normalizeUrl(tool.website) : null;

    if (normUrl && byUrl.has(normUrl)) {
      const idx = byUrl.get(normUrl);
      mergeTool(cleaned[idx], tool);
      continue;
    }

    cleaned.push({ ...tool });
    if (normUrl) {
      byUrl.set(normUrl, cleaned.length - 1);
    }
  }

  const used = new Set();
  for (const tool of cleaned) {
    let base = slugify(tool.slug) || slugify(tool.name);
    if (!base) {
      base = `tool-${tool.id}`;
    }

    let slug = base;
    if (used.has(slug)) {
      const domainSlug = slugify(getDomain(tool.website).replace(/\./g, '-'));
      if (domainSlug) {
        slug = `${base}-${domainSlug}`;
      }
      let i = 2;
      while (used.has(slug)) {
        slug = domainSlug ? `${base}-${domainSlug}-${i}` : `${base}-${i}`;
        i += 1;
      }
    }

    tool.slug = slug;
    used.add(slug);
  }

  fs.writeFileSync(toolsPath, JSON.stringify(cleaned, null, 2));
  updateCategories(cleaned);
  updateMetadata(cleaned);

  console.log(`✅ Tools cleaned: ${raw.length} -> ${cleaned.length}`);
}

cleanTools();
