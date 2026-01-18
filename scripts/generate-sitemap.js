const fs = require('fs');
const path = require('path');

// Load data
const toolsData = require('../src/data/tools.json');
const categoriesData = require('../src/data/categories.json');

const baseUrl = 'https://findaidir.com';

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/tools/', priority: '0.9', changefreq: 'daily' },
    { url: '/categories/', priority: '0.8', changefreq: 'weekly' },
    { url: '/submit/', priority: '0.7', changefreq: 'monthly' },
    { url: '/advertise/', priority: '0.6', changefreq: 'monthly' },
    { url: '/about/', priority: '0.5', changefreq: 'monthly' },
    { url: '/contact/', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy/', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms/', priority: '0.3', changefreq: 'yearly' },
  ];

  // Category pages
  const categoryPages = categoriesData.map(cat => ({
    url: `/category/${cat.slug}/`,
    priority: '0.7',
    changefreq: 'weekly'
  }));

  // Tool pages
  const toolPages = toolsData.map(tool => ({
    url: `/tool/${tool.slug}/`,
    priority: '0.6',
    changefreq: 'monthly'
  }));

  const allPages = [...staticPages, ...categoryPages, ...toolPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Write to public folder
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);

  console.log(`✅ Sitemap generated with ${allPages.length} URLs`);
  console.log(`   - ${staticPages.length} static pages`);
  console.log(`   - ${categoryPages.length} category pages`);
  console.log(`   - ${toolPages.length} tool pages`);
}

generateSitemap();
