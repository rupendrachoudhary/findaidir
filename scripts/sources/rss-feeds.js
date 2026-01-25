/**
 * RSS Feed AI Tools Discovery
 * Parses AI news RSS feeds for new tool announcements
 *
 * Free and unlimited
 */

const https = require('https');
const http = require('http');

// AI News RSS Feeds
const RSS_FEEDS = [
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/tag/artificial-intelligence/feed/',
  },
];

// Keywords that indicate a new tool announcement
const TOOL_KEYWORDS = [
  'launches',
  'introduces',
  'announces',
  'releases',
  'unveils',
  'new tool',
  'new app',
  'new platform',
  'now available',
  'beta',
  'open source',
];

/**
 * Fetch RSS feed content
 */
function fetchFeed(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'AI-Tools-Directory/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchFeed(res.headers.location).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Simple XML parser for RSS items
 */
function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(itemXml);
    const linkMatch = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i.exec(itemXml);
    const descMatch = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i.exec(itemXml);
    const dateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemXml);

    if (titleMatch) {
      items.push({
        title: titleMatch[1].trim().replace(/<[^>]+>/g, ''),
        link: linkMatch ? linkMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim().replace(/<[^>]+>/g, '').substring(0, 300) : '',
        pubDate: dateMatch ? new Date(dateMatch[1].trim()) : new Date(),
      });
    }
  }

  return items;
}

/**
 * Check if an article is about a new tool
 */
function isToolAnnouncement(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  // Must contain AI-related terms
  const hasAI = ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'chatbot', 'claude', 'gemini']
    .some(term => text.includes(term));

  if (!hasAI) return false;

  // Must contain tool announcement keywords
  return TOOL_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * Extract tool name from title
 */
function extractToolName(title) {
  // Common patterns: "Company launches X", "X: New AI Tool", "Introducing X"

  // Pattern: "X launches Y"
  const launchMatch = /(\w+(?:\s+\w+)?)\s+(?:launches|introduces|unveils|announces|releases)/i.exec(title);
  if (launchMatch) {
    // Try to find what was launched after
    const afterMatch = /(?:launches|introduces|unveils|announces|releases)\s+(.+?)(?:\s+[-–—,]|$)/i.exec(title);
    if (afterMatch) return afterMatch[1].trim();
    return launchMatch[1].trim();
  }

  // Pattern: "Introducing X"
  const introMatch = /introducing\s+(.+?)(?:\s+[-–—,:]|$)/i.exec(title);
  if (introMatch) return introMatch[1].trim();

  // Pattern: "X: description"
  const colonMatch = /^([^:]+):/i.exec(title);
  if (colonMatch && colonMatch[1].length < 40) return colonMatch[1].trim();

  // Default: first few words
  return title.split(/\s+/).slice(0, 3).join(' ');
}

/**
 * Convert RSS item to tool format
 */
function itemToTool(item, feedName) {
  const name = extractToolName(item.title);

  return {
    name: name,
    category: 'productivity', // Default, would need NLP to categorize better
    tags: `${feedName}, news`,
    description: item.description || item.title,
    website: item.link,
    source: 'rss',
    feedName: feedName,
    pubDate: item.pubDate,
    discoveredAt: new Date().toISOString(),
  };
}

/**
 * Main discovery function
 */
async function discoverFromRSS() {
  console.log('🔍 Discovering AI tools from RSS feeds...\n');

  const allTools = [];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (const feed of RSS_FEEDS) {
    console.log(`  Fetching: ${feed.name}...`);

    try {
      const xml = await fetchFeed(feed.url);
      const items = parseRSSItems(xml);

      // Filter to recent tool announcements
      const recentItems = items.filter(item => {
        const isRecent = item.pubDate > oneWeekAgo;
        const isTool = isToolAnnouncement(item.title, item.description);
        return isRecent && isTool;
      });

      console.log(`    Found ${recentItems.length} tool announcements`);

      for (const item of recentItems) {
        allTools.push(itemToTool(item, feed.name));
      }
    } catch (error) {
      console.error(`    Error fetching ${feed.name}:`, error.message);
    }
  }

  console.log(`\n✅ Found ${allTools.length} potential tools from RSS feeds\n`);

  return allTools;
}

module.exports = { discoverFromRSS };

// Run standalone
if (require.main === module) {
  discoverFromRSS()
    .then(tools => {
      console.log('Discovered tools:');
      tools.forEach(t => console.log(`  - ${t.name}: ${t.website}`));
    })
    .catch(console.error);
}
