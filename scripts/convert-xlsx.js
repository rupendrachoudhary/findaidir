const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// New tools to add (Dec 2025 - Jan 2026)
// Using lowercase category names to match existing conventions
const newTools = [
  // Popular Tools (User Requested - Jan 2026)
  { name: "Claude Code", category: "code assistant", tags: "AI coding, CLI, Anthropic", description: "Anthropic's AI-powered coding assistant and CLI tool", website: "https://claude.ai" },
  { name: "Cursor", category: "code assistant", tags: "AI IDE, code editor", description: "AI-first code editor built on VS Code", website: "https://cursor.com" },
  { name: "Windsurf", category: "code assistant", tags: "AI IDE, Codeium", description: "AI-powered IDE by Codeium", website: "https://codeium.com/windsurf" },
  { name: "Gemini CLI", category: "code assistant", tags: "Google, CLI, terminal", description: "Google's command-line AI coding assistant", website: "https://github.com/google-gemini/gemini-cli" },
  { name: "v0 by Vercel", category: "code assistant", tags: "UI generation, React", description: "AI-powered UI component generator", website: "https://v0.dev" },
  { name: "Bolt.new", category: "code assistant", tags: "full-stack, browser IDE", description: "AI full-stack app builder in browser", website: "https://bolt.new" },
  { name: "Lovable", category: "code assistant", tags: "app builder, no-code", description: "AI-powered app development platform", website: "https://lovable.dev" },
  { name: "Devin", category: "ai agents", tags: "autonomous coding, software engineer", description: "First AI software engineer agent", website: "https://devin.ai" },
  { name: "Manus AI", category: "ai agents", tags: "autonomous agent, general purpose", description: "General-purpose autonomous AI agent", website: "https://manus.ai" },
  { name: "Perplexity", category: "search engine", tags: "AI search, research", description: "AI-powered search engine with citations", website: "https://perplexity.ai" },
  { name: "NotebookLM", category: "research", tags: "Google, document analysis", description: "Google's AI research and note-taking tool", website: "https://notebooklm.google" },
  { name: "WisprFlow", category: "personal assistant", tags: "voice, transcription", description: "Voice-to-text AI assistant", website: "https://wisprflow.ai" },
  { name: "Stitch by Google", category: "design generators", tags: "UI design, Google", description: "Google's AI design tool", website: "https://stitch.withgoogle.com" },
  { name: "ClawdBot", category: "ai chatbots", tags: "Discord, Claude", description: "Claude-powered Discord bot", website: "https://clawdbot.com" },
  { name: "Replit Agent", category: "code assistant", tags: "browser IDE, AI coding", description: "AI coding agent in Replit", website: "https://replit.com" },
  { name: "Aider", category: "code assistant", tags: "CLI, pair programming, open source", description: "AI pair programming in terminal", website: "https://aider.chat" },
  { name: "Continue", category: "code assistant", tags: "VS Code, open source", description: "Open source AI code assistant", website: "https://continue.dev" },
  { name: "Pieces", category: "code assistant", tags: "snippets, context", description: "AI-powered code snippet manager", website: "https://pieces.app" },

  // Coding Agents & IDEs
  { name: "OpenCode", category: "code assistant", tags: "AI coding agent, terminal, open source", description: "Open-source AI coding agent with Claude Code-level capabilities, model-agnostic", website: "https://opencode.ai" },
  { name: "Goose", category: "code assistant", tags: "AI agent, automation, open source", description: "Local extensible AI agent that installs, executes, edits, and tests with any LLM", website: "https://github.com/block/goose" },
  { name: "Cline", category: "code assistant", tags: "AI coding agent, autonomous, MCP", description: "Open-source autonomous coding agent with planning, execution, and browser automation", website: "https://github.com/cline/cline" },
  { name: "Kilo Code", category: "code assistant", tags: "AI coding, context management", description: "AI coding tool with structured modes and tighter context handling", website: "https://kilocode.ai" },
  { name: "Kiro", category: "code assistant", tags: "spec-driven development, DevOps", description: "AI coding agent for spec-driven development and DevOps automation", website: "https://kiro.dev" },
  { name: "Zencoder", category: "code assistant", tags: "AI coding, spec-driven", description: "AI coding assistant for spec-driven development workflows", website: "https://zencoder.ai" },
  { name: "Traycer AI", category: "code assistant", tags: "AI coding, planning, specs", description: "AI coding tool with plan-first specs and verification checks", website: "https://traycer.ai" },
  { name: "GitHub Spec Kit", category: "code assistant", tags: "spec-driven development, GitHub", description: "Spec-Driven Development CLI for generating code from structured specifications", website: "https://github.com/github/spec-kit" },
  { name: "Mistral Vibe CLI", category: "code assistant", tags: "CLI, open source, Mistral", description: "Open-source command-line coding assistant from Mistral", website: "https://github.com/mistralai/vibe-cli" },
  { name: "Sweeper", category: "code assistant", tags: "cache cleanup, disk space, developer tools", description: "Open-source tool to scan and clean developer cache and build directories", website: "https://github.com/nichochar/sweeper" },

  // AI Models & Platforms
  { name: "Claude Opus 4.5", category: "ai chatbots", tags: "LLM, coding, Anthropic", description: "State-of-the-art LLM with 80.9% SWE-bench score, best-in-class coding", website: "https://anthropic.com" },
  { name: "GPT-5.2-Codex", category: "code assistant", tags: "OpenAI, coding, 400K context", description: "OpenAI's coding-optimized model with 400K context window", website: "https://openai.com" },
  { name: "Gemini 3", category: "ai chatbots", tags: "Google, multimodal, generative UI", description: "Google's flagship model with 1501 Elo score and generative UI capabilities", website: "https://deepmind.google/gemini" },
  { name: "Devstral 2", category: "ai chatbots", tags: "Mistral, open source, coding", description: "Mistral's open source coding model in 123B and 24B sizes", website: "https://mistral.ai" },
  { name: "Grok 4.1", category: "ai chatbots", tags: "xAI, reasoning", description: "xAI's December 2025 release with improved reasoning", website: "https://x.ai" },
  { name: "Gemini 3 Deep Think", category: "ai chatbots", tags: "Google, reasoning, math", description: "Dedicated mode for long-form high-precision reasoning", website: "https://deepmind.google/gemini" },

  // AI Agent Platforms
  { name: "Google Antigravity", category: "code assistant", tags: "Google, free, multi-agent", description: "Free Claude Opus 4.5 access with multi-agent orchestration", website: "https://antigravity.dev" },
  { name: "Claude Cowork", category: "personal assistant", tags: "Anthropic, desktop, agentic", description: "Agentic capabilities for non-developers via desktop app", website: "https://claude.ai/cowork" },
  { name: "Dvina", category: "ai agents", tags: "enterprise automation, multi-agent", description: "Governed enterprise automation across 120+ apps", website: "https://dvina.ai" },
  { name: "Aident AI", category: "ai agents", tags: "SOPs, automation, SMB", description: "Turns plain-English SOPs into deterministic playbooks", website: "https://aident.ai" },
  { name: "1mind", category: "ai agents", tags: "voice AI, customer support", description: "Voice-based AI agents for customer support", website: "https://1mind.ai" },
  { name: "Decagon", category: "ai agents", tags: "customer service, enterprise", description: "Specialized AI agents for customer service workflows", website: "https://decagon.ai" },

  // Infrastructure & Frameworks
  { name: "Langflow", category: "low-code/no-code", tags: "AI workflows, drag-and-drop, RAG", description: "Low-code platform for designing AI-powered agents and RAG workflows", website: "https://langflow.org" },
  { name: "Dify", category: "low-code/no-code", tags: "AI agents, self-hosted, open source", description: "Open-source platform for building ChatGPT-like services and agents", website: "https://dify.ai" },
  { name: "NVIDIA Alpamayo", category: "ai agents", tags: "robotics, autonomous vehicles, open source", description: "Open source AI models for robotics and autonomous vehicles", website: "https://github.com/nvidia/alpamayo" },
  { name: "NVIDIA AlpaSim", category: "ai agents", tags: "simulation, autonomous driving", description: "Open-source simulation framework for autonomous driving systems", website: "https://github.com/nvidia/alpasim" },
  { name: "Google Workspace Studio", category: "ai agents", tags: "automation, Google Workspace", description: "AI automation hub for Gmail, Drive, and Chat using natural language", website: "https://workspace.google.com/studio" },

  // Creative & Productivity
  { name: "Gamma", category: "design generators", tags: "presentations, slides, AI", description: "AI-powered presentation and visual storytelling platform", website: "https://gamma.app" },
  { name: "Runway Gen-4.5", category: "video generators", tags: "text-to-video, production-ready", description: "Text-to-video with realistic motion and physics", website: "https://runway.ml" },
  { name: "CogniMemo", category: "personal assistant", tags: "LLM, memory, context-aware", description: "LLM prompting with persistent memory across apps", website: "https://cognimemo.com" },
  { name: "Friendware", category: "writing generators", tags: "tab-complete, macOS", description: "System-wide tab-to-complete AI suggestions on macOS", website: "https://friendware.ai" },
];

// Helper to create slug from string
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Read existing xlsx
const xlsxPath = path.join(__dirname, '../../All_ai_tools.xlsx');
console.log('Reading xlsx from:', xlsxPath);

const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Found ${data.length} existing tools in xlsx`);

// Create a map of existing tools by lowercase name for deduplication
const existingToolNames = new Set(data.map(row => row['Tool Name']?.toLowerCase().trim()));

// Add new tools that don't already exist
let addedCount = 0;
for (const tool of newTools) {
  const lowerName = tool.name.toLowerCase().trim();
  if (!existingToolNames.has(lowerName)) {
    data.push({
      'Tool Name': tool.name,
      'Category': tool.category,
      'Tags': tool.tags,
      'Description': tool.description,
      'Website Link': tool.website
    });
    existingToolNames.add(lowerName);
    addedCount++;
    console.log(`  Added: ${tool.name}`);
  } else {
    console.log(`  Skipped (duplicate): ${tool.name}`);
  }
}

console.log(`\nAdded ${addedCount} new tools`);

// Get today's date in ISO format
const TODAY = new Date().toISOString().split('T')[0];
const BASELINE_DATE = '2025-01-01';

// Set of new tool names (lowercase) - these get today's date
const newToolNames = new Set(newTools.map(t => t.name.toLowerCase()));

// Convert to tools.json format
const tools = data.map((row, index) => {
  const name = row['Tool Name'] || '';
  const category = row['Category'] || 'Other';
  const tagsStr = row['Tags'] || category;
  const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);

  // Use today's date for new tools, baseline for existing
  const dateAdded = newToolNames.has(name.toLowerCase().trim()) ? TODAY : BASELINE_DATE;

  return {
    id: index + 1,
    name: name.trim(),
    slug: slugify(name),
    category: category.trim(),
    categorySlug: slugify(category),
    tags: tags.length > 0 ? tags : [category],
    description: (row['Description'] || '').trim(),
    website: (row['Website Link'] || '').trim(),
    dateAdded: dateAdded
  };
});

console.log(`\nTotal tools after merge: ${tools.length}`);

// Generate category counts
const categoryMap = new Map();
for (const tool of tools) {
  const key = tool.category;
  if (!categoryMap.has(key)) {
    categoryMap.set(key, {
      name: tool.category,
      slug: tool.categorySlug,
      count: 0
    });
  }
  categoryMap.get(key).count++;
}

// Sort categories by count descending
const categories = Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
console.log(`Found ${categories.length} unique categories`);

// Write tools.json
const toolsPath = path.join(__dirname, '../src/data/tools.json');
fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
console.log(`\nWrote ${tools.length} tools to ${toolsPath}`);

// Write categories.json
const categoriesPath = path.join(__dirname, '../src/data/categories.json');
fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
console.log(`Wrote ${categories.length} categories to ${categoriesPath}`);

// Update xlsx with new tools
const newSheet = XLSX.utils.json_to_sheet(data.map(row => ({
  'Tool Name': row['Tool Name'],
  'Category': row['Category'],
  'Tags': row['Tags'],
  'Description': row['Description'],
  'Website Link': row['Website Link']
})));

const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'AI Tools');
XLSX.writeFile(newWorkbook, xlsxPath);
console.log(`\nUpdated xlsx file with ${data.length} total tools`);

console.log('\nDone!');
