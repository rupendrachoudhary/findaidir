/**
 * GitHub Trending AI Tools Discovery
 * Fetches trending repositories with AI/ML topics
 *
 * Rate limit: 60 requests/hour (unauthenticated)
 * Docs: https://docs.github.com/en/rest/search/search
 */

const https = require('https');

// AI-related topics to search for
const AI_TOPICS = [
  'artificial-intelligence',
  'machine-learning',
  'llm',
  'chatgpt',
  'langchain',
  'ai-agent',
  'generative-ai',
  'large-language-model',
];

// AI-related keywords
const AI_KEYWORDS = [
  'ai tool',
  'ai assistant',
  'llm',
  'chatbot',
  'ai agent',
  'copilot',
  'ai coding',
];

/**
 * Fetch data from GitHub API
 */
function fetchGitHub(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'AI-Tools-Directory',
        'Accept': 'application/vnd.github.v3+json',
      },
    };

    const req = https.request(options, (res) => {
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
 * Search for trending AI repositories
 */
async function searchTrendingRepos(query, options = {}) {
  const { minStars = 100, createdAfter = '2024-01-01' } = options;

  const searchQuery = encodeURIComponent(
    `${query} stars:>=${minStars} created:>=${createdAfter}`
  );

  const path = `/search/repositories?q=${searchQuery}&sort=stars&order=desc&per_page=30`;

  try {
    const result = await fetchGitHub(path);
    return result.items || [];
  } catch (error) {
    console.error(`Error searching for "${query}":`, error.message);
    return [];
  }
}

/**
 * Convert GitHub repo to tool format
 */
function repoToTool(repo) {
  // Determine category based on topics and description
  const description = (repo.description || '').toLowerCase();
  const topics = repo.topics || [];

  let category = 'code assistant';
  let tags = [];

  if (topics.includes('chatbot') || description.includes('chatbot')) {
    category = 'ai chatbots';
  } else if (topics.includes('agent') || description.includes('agent')) {
    category = 'ai agents';
  } else if (description.includes('image') || description.includes('art')) {
    category = 'ai art generator';
  } else if (description.includes('voice') || description.includes('speech')) {
    category = 'voice generators';
  } else if (description.includes('video')) {
    category = 'video generators';
  }

  // Build tags from topics
  tags = topics
    .filter(t => !['hacktoberfest', 'awesome-list'].includes(t))
    .slice(0, 5);

  if (repo.language) {
    tags.push(repo.language);
  }

  tags.push('open source');

  return {
    name: repo.name,
    category: category,
    tags: tags.join(', '),
    description: repo.description || `${repo.name} - Open source AI tool`,
    website: repo.html_url,
    source: 'github',
    stars: repo.stargazers_count,
    discoveredAt: new Date().toISOString(),
  };
}

/**
 * Main discovery function
 */
async function discoverFromGitHub() {
  console.log('🔍 Discovering AI tools from GitHub Trending...\n');

  const allRepos = new Map();

  // Search by keywords
  for (const keyword of AI_KEYWORDS) {
    console.log(`  Searching: "${keyword}"...`);
    const repos = await searchTrendingRepos(keyword, {
      minStars: 500,
      createdAfter: '2024-06-01',
    });

    for (const repo of repos) {
      if (!allRepos.has(repo.id)) {
        allRepos.set(repo.id, repo);
      }
    }

    // Rate limit protection
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Convert to tools format
  const tools = Array.from(allRepos.values())
    .map(repoToTool)
    .filter(tool => tool.description && tool.description.length > 10);

  console.log(`\n✅ Found ${tools.length} potential tools from GitHub\n`);

  return tools;
}

module.exports = { discoverFromGitHub };

// Run standalone
if (require.main === module) {
  discoverFromGitHub()
    .then(tools => {
      console.log('Discovered tools:');
      tools.slice(0, 10).forEach(t => console.log(`  - ${t.name}: ${t.description?.substring(0, 60)}...`));
    })
    .catch(console.error);
}
