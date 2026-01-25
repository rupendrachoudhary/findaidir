const fs = require('fs');
const path = require('path');

/**
 * Backfill dateAdded field for existing tools
 * - Existing tools get baseline date: 2025-01-01
 * - New tools (added in this batch) get today's date
 */

const BASELINE_DATE = '2025-01-01';
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

// List of new tool names (these get today's date)
const NEW_TOOL_NAMES = new Set([
  'Claude Code',
  'Cursor',
  'Windsurf',
  'Gemini CLI',
  'v0 by Vercel',
  'Bolt.new',
  'Lovable',
  'Devin',
  'Manus AI',
  'Perplexity',
  'NotebookLM',
  'WisprFlow',
  'Stitch by Google',
  'ClawdBot',
  'Replit Agent',
  'Aider',
  'Continue',
  'Pieces',
  // Add Dec 2025 - Jan 2026 batch
  'OpenCode',
  'Goose',
  'Cline',
  'Kilo Code',
  'Kiro',
  'Zencoder',
  'Traycer AI',
  'GitHub Spec Kit',
  'Mistral Vibe CLI',
  'Sweeper',
  'Claude Opus 4.5',
  'GPT-5.2-Codex',
  'Gemini 3',
  'Devstral 2',
  'Grok 4.1',
  'Gemini 3 Deep Think',
  'Google Antigravity',
  'Claude Cowork',
  'Dvina',
  'Aident AI',
  '1mind',
  'Decagon',
  'Langflow',
  'Dify',
  'NVIDIA Alpamayo',
  'NVIDIA AlpaSim',
  'Google Workspace Studio',
  'Gamma',
  'Runway Gen-4.5',
  'CogniMemo',
  'Friendware',
].map(name => name.toLowerCase()));

// Read tools.json
const toolsPath = path.join(__dirname, '../src/data/tools.json');
console.log('Reading tools from:', toolsPath);

const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
console.log(`Found ${tools.length} tools`);

// Track stats
let existingCount = 0;
let newCount = 0;
let alreadyHasDate = 0;

// Add dateAdded to each tool
for (const tool of tools) {
  if (tool.dateAdded) {
    alreadyHasDate++;
    continue;
  }

  const lowerName = tool.name.toLowerCase();
  if (NEW_TOOL_NAMES.has(lowerName)) {
    tool.dateAdded = TODAY;
    newCount++;
    console.log(`  New: ${tool.name} → ${TODAY}`);
  } else {
    tool.dateAdded = BASELINE_DATE;
    existingCount++;
  }
}

// Write updated tools.json
fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));

console.log('\n--- Summary ---');
console.log(`Tools with baseline date (${BASELINE_DATE}): ${existingCount}`);
console.log(`New tools with today's date (${TODAY}): ${newCount}`);
console.log(`Already had dateAdded: ${alreadyHasDate}`);
console.log(`Total tools: ${tools.length}`);
console.log('\nDone! Updated tools.json with dateAdded field.');
