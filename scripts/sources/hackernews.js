/**
 * Hacker News AI Tools Discovery
 * Fetches "Show HN" posts about AI tools
 *
 * Uses Algolia HN Search API (free, unlimited)
 * Docs: https://hn.algolia.com/api
 */

const https = require('https');

// AI-related keywords to search for
const AI_KEYWORDS = [
  'AI',
  'LLM',
  'GPT',
  'ChatGPT',
  'Claude',
  'Gemini',
  'AI tool',
  'AI assistant',
  'AI agent',
  'machine learning',
];

/**
 * Fetch data from Algolia HN API
 */
function fetchHN(query, options = {}) {
  return new Promise((resolve, reject) => {
    const { tags = 'show_hn', numericFilters = '' } = options;

    const searchQuery = encodeURIComponent(query);
    const path = `/api/v1/search?query=${searchQuery}&tags=${tags}&hitsPerPage=50${numericFilters ? `&numericFilters=${numericFilters}` : ''}`;

    const reqOptions = {
      hostname: 'hn.algolia.com',
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Extract URL from HN post
 */
function extractUrl(hit) {
  // First try the direct URL
  if (hit.url) return hit.url;

  // Otherwise link to HN discussion
  return `https://news.ycombinator.com/item?id=${hit.objectID}`;
}

/**
 * Determine category from title and URL
 */
function categorize(title, url) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('chat') || lowerTitle.includes('bot')) {
    return 'ai chatbots';
  }
  if (lowerTitle.includes('code') || lowerTitle.includes('programming') || lowerTitle.includes('ide')) {
    return 'code assistant';
  }
  if (lowerTitle.includes('agent')) {
    return 'ai agents';
  }
  if (lowerTitle.includes('image') || lowerTitle.includes('art') || lowerTitle.includes('design')) {
    return 'ai art generator';
  }
  if (lowerTitle.includes('voice') || lowerTitle.includes('audio') || lowerTitle.includes('speech')) {
    return 'voice generators';
  }
  if (lowerTitle.includes('video')) {
    return 'video generators';
  }
  if (lowerTitle.includes('search')) {
    return 'search engine';
  }
  if (lowerTitle.includes('writing') || lowerTitle.includes('content')) {
    return 'writing generators';
  }

  return 'productivity';
}

/**
 * Convert HN post to tool format
 */
function postToTool(hit) {
  // Clean up the title (remove "Show HN:" prefix)
  let name = hit.title
    .replace(/^Show HN:\s*/i, '')
    .replace(/\s*[-–—]\s*.+$/, '') // Remove subtitle after dash
    .trim();

  // If name is too long, truncate
  if (name.length > 50) {
    name = name.substring(0, 47) + '...';
  }

  const url = extractUrl(hit);
  const category = categorize(hit.title, url);

  return {
    name: name,
    category: category,
    tags: `HackerNews, Show HN, ${category}`,
    description: hit.title.replace(/^Show HN:\s*/i, ''),
    website: url,
    source: 'hackernews',
    points: hit.points,
    hnId: hit.objectID,
    discoveredAt: new Date().toISOString(),
  };
}

/**
 * Main discovery function
 */
async function discoverFromHackerNews() {
  console.log('🔍 Discovering AI tools from Hacker News...\n');

  const allPosts = new Map();

  // Calculate timestamp for last 30 days
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

  // Search by keywords
  for (const keyword of AI_KEYWORDS) {
    console.log(`  Searching: "${keyword}"...`);

    try {
      const result = await fetchHN(keyword, {
        tags: 'show_hn',
        numericFilters: `created_at_i>${thirtyDaysAgo},points>10`,
      });

      for (const hit of result.hits || []) {
        if (!allPosts.has(hit.objectID)) {
          allPosts.set(hit.objectID, hit);
        }
      }
    } catch (error) {
      console.error(`  Error searching "${keyword}":`, error.message);
    }

    // Small delay to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Convert to tools format, filter by points
  const tools = Array.from(allPosts.values())
    .filter(hit => hit.points >= 20) // Only popular posts
    .map(postToTool)
    .filter(tool => tool.name.length > 3);

  console.log(`\n✅ Found ${tools.length} potential tools from Hacker News\n`);

  return tools;
}

module.exports = { discoverFromHackerNews };

// Run standalone
if (require.main === module) {
  discoverFromHackerNews()
    .then(tools => {
      console.log('Discovered tools:');
      tools.slice(0, 10).forEach(t => console.log(`  - ${t.name} (${t.points} points): ${t.website}`));
    })
    .catch(console.error);
}
