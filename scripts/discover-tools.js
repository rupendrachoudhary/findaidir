#!/usr/bin/env node

/**
 * AI Tools Discovery Orchestrator
 * Fetches new AI tools from multiple free sources
 *
 * Usage:
 *   node scripts/discover-tools.js           # Run all sources
 *   node scripts/discover-tools.js --dry-run # Preview without saving
 *   node scripts/discover-tools.js --source github  # Run specific source
 */

const { discoverFromGitHub } = require('./sources/github-trending');
const { discoverFromHackerNews } = require('./sources/hackernews');
const { discoverFromRSS } = require('./sources/rss-feeds');
const { filterDuplicates, addNewTools } = require('./deduplicate');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const sourceArg = args.find(a => a.startsWith('--source='));
const specificSource = sourceArg ? sourceArg.split('=')[1] : null;

async function main() {
  console.log('='.repeat(60));
  console.log('🤖 AI Tools Discovery - Starting');
  console.log('='.repeat(60));
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE (will update tools.json)'}`);
  console.log(`Sources: ${specificSource || 'all'}`);
  console.log('');

  const allDiscovered = [];

  // Run discovery sources
  const sources = {
    github: discoverFromGitHub,
    hackernews: discoverFromHackerNews,
    rss: discoverFromRSS,
  };

  for (const [name, discoveryFn] of Object.entries(sources)) {
    if (specificSource && specificSource !== name) continue;

    try {
      console.log(`\n--- ${name.toUpperCase()} ---`);
      const tools = await discoveryFn();
      allDiscovered.push(...tools);
    } catch (error) {
      console.error(`Error running ${name} discovery:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Discovery Summary`);
  console.log('='.repeat(60));
  console.log(`Total discovered: ${allDiscovered.length}`);

  // Filter duplicates
  const { unique, duplicates } = filterDuplicates(allDiscovered);

  console.log(`Duplicates filtered: ${duplicates.length}`);
  console.log(`New unique tools: ${unique.length}`);

  if (unique.length === 0) {
    console.log('\n✅ No new tools to add.');
    return;
  }

  // Show preview of new tools
  console.log('\n📋 New Tools Preview:');
  unique.slice(0, 20).forEach((tool, i) => {
    console.log(`  ${i + 1}. ${tool.name}`);
    console.log(`     Category: ${tool.category}`);
    console.log(`     URL: ${tool.website}`);
    console.log(`     Source: ${tool.source}`);
  });

  if (unique.length > 20) {
    console.log(`  ... and ${unique.length - 20} more`);
  }

  // Add to tools.json (unless dry run)
  if (!isDryRun) {
    console.log('\n💾 Adding new tools to database...');
    const totalTools = addNewTools(unique);
    console.log(`✅ Done! Total tools now: ${totalTools}`);
  } else {
    console.log('\n🔍 DRY RUN - No changes made.');
    console.log('   Run without --dry-run to add these tools.');
  }

  // Output summary for GitHub Actions
  if (process.env.GITHUB_ACTIONS) {
    const fs = require('fs');
    const summary = `## AI Tools Discovery Summary

- **Total Discovered**: ${allDiscovered.length}
- **Duplicates Filtered**: ${duplicates.length}
- **New Tools Added**: ${unique.length}

### New Tools
${unique.slice(0, 10).map(t => `- ${t.name} (${t.category})`).join('\n')}
${unique.length > 10 ? `\n... and ${unique.length - 10} more` : ''}
`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
