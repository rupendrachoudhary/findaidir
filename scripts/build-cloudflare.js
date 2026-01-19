const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the normal Next.js build
console.log('Building Next.js project...');
execSync('npm run generate-sitemap && next build', { stdio: 'inherit' });

// Remove RSC segment files (.txt) to reduce file count for Cloudflare Pages
// These are only needed for client-side soft navigation
// Site still works perfectly without them (full page reloads instead)
console.log('\nRemoving RSC segment files for Cloudflare Pages...');

const outDir = path.join(__dirname, '..', 'out');

function removeTextFiles(dir) {
  let removed = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      removed += removeTextFiles(filePath);
    } else if (file.endsWith('.txt')) {
      fs.unlinkSync(filePath);
      removed++;
    }
  }

  return removed;
}

const removedCount = removeTextFiles(outDir);
console.log(`Removed ${removedCount} RSC segment files`);

// Count remaining files
function countFiles(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += countFiles(filePath);
    } else {
      count++;
    }
  }

  return count;
}

const totalFiles = countFiles(outDir);
console.log(`\nTotal files in output: ${totalFiles}`);

if (totalFiles > 20000) {
  console.error('ERROR: Still exceeds Cloudflare Pages 20,000 file limit!');
  process.exit(1);
} else {
  console.log('Ready for Cloudflare Pages deployment!');
}
