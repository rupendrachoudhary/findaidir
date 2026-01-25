#!/usr/bin/env node

/**
 * Interactive Tool Addition Script
 * Easily add new AI tools manually with prompts
 *
 * Usage:
 *   node scripts/add-tools-interactive.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Categories for auto-suggestion
const COMMON_CATEGORIES = [
  'code assistant',
  'ai chatbots',
  'ai agents',
  'ai art generator',
  'video generators',
  'voice generators',
  'writing generators',
  'productivity',
  'search engine',
  'research',
  'design generators',
  'personal assistant',
  'marketing',
  'customer support',
  'low-code/no-code',
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function addTool() {
  console.log('\n🤖 Add New AI Tool');
  console.log('='.repeat(40));

  // Get tool details
  const name = await question('Tool Name: ');
  if (!name.trim()) {
    console.log('Name is required. Aborting.');
    return null;
  }

  const website = await question('Website URL: ');

  console.log('\nAvailable categories:');
  COMMON_CATEGORIES.forEach((cat, i) => console.log(`  ${i + 1}. ${cat}`));

  const categoryInput = await question('\nCategory (name or number): ');
  let category;
  const catNum = parseInt(categoryInput, 10);
  if (catNum >= 1 && catNum <= COMMON_CATEGORIES.length) {
    category = COMMON_CATEGORIES[catNum - 1];
  } else {
    category = categoryInput.trim() || 'productivity';
  }

  const tags = await question('Tags (comma-separated): ');
  const description = await question('Description: ');

  const tool = {
    name: name.trim(),
    website: website.trim(),
    category: category,
    tags: tags,
    description: description.trim(),
  };

  console.log('\n📋 Tool Preview:');
  console.log(JSON.stringify(tool, null, 2));

  const confirm = await question('\nAdd this tool? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    return null;
  }

  return tool;
}

async function main() {
  console.log('═'.repeat(50));
  console.log('   AI Tools Directory - Interactive Addition');
  console.log('═'.repeat(50));

  const toolsPath = path.join(__dirname, '../src/data/tools.json');
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
  const existingNames = new Set(tools.map(t => t.name.toLowerCase()));

  const newTools = [];

  while (true) {
    const tool = await addTool();

    if (tool) {
      // Check for duplicate
      if (existingNames.has(tool.name.toLowerCase())) {
        console.log('⚠️  Tool already exists! Skipping.');
      } else {
        newTools.push(tool);
        existingNames.add(tool.name.toLowerCase());
        console.log('✅ Tool queued for addition.');
      }
    }

    const another = await question('\nAdd another tool? (y/n): ');
    if (another.toLowerCase() !== 'y') break;
  }

  if (newTools.length === 0) {
    console.log('\nNo new tools to add. Goodbye!');
    rl.close();
    return;
  }

  // Add all new tools
  console.log(`\n💾 Adding ${newTools.length} new tool(s)...`);

  const today = new Date().toISOString().split('T')[0];
  let maxId = Math.max(...tools.map(t => t.id));

  for (const tool of newTools) {
    maxId++;
    tools.push({
      id: maxId,
      name: tool.name,
      slug: slugify(tool.name),
      category: tool.category,
      categorySlug: slugify(tool.category),
      tags: tool.tags.split(',').map(t => t.trim()).filter(Boolean),
      description: tool.description,
      website: tool.website,
      dateAdded: today,
    });
  }

  // Write tools
  fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));

  // Update categories
  const categoryMap = new Map();
  for (const tool of tools) {
    if (!categoryMap.has(tool.category)) {
      categoryMap.set(tool.category, { name: tool.category, slug: tool.categorySlug, count: 0 });
    }
    categoryMap.get(tool.category).count++;
  }
  const categories = Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  const categoriesPath = path.join(__dirname, '../src/data/categories.json');
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));

  // Update metadata
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const newThisWeek = tools.filter(t => t.dateAdded && t.dateAdded >= oneWeekAgo).length;
  const metadata = {
    lastUpdated: new Date().toISOString(),
    toolCount: tools.length,
    newThisWeek: newThisWeek,
  };
  const metadataPath = path.join(__dirname, '../src/data/metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`✅ Added ${newTools.length} tools. Total: ${tools.length}`);
  console.log('📊 Categories and metadata updated.');
  console.log('\nDone! Run `npm run build` to rebuild the site.');

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
