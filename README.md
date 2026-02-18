# FindAIDir (findaidir.com) - AI Tools Directory

Production-ready AI tools directory with:

- Data cleaning + live URL validation.
- New-tool enrichment via web scraping.
- Cloudflare Pages/Workers + D1 architecture.
- Security/performance defaults for free-plan launch.

## Current dataset status

Source input: `All_ai_tools.xlsx`

- Original rows: `6089`
- URL-valid rows after audit: `4930`
- Suspected corrupted legacy rows dropped (name-domain mismatch): `524`
- New scraped + validated tools added: `220`
- Final enriched rows: `4513`

Generated outputs:

- Cleaned CSV: `data/tools_cleaned.csv`
- API seed JSON: `data/tools_seed.json`
- D1 SQL seed: `data/seed.sql`
- Final XLSX: `All_ai_tools_cleaned_enriched.xlsx`

## Data pipeline

```bash
# 1) Audit original XLSX links
python3 scripts/audit_links.py --xlsx All_ai_tools.xlsx --out-dir audit

# 2) Scrape + validate additional tools
python3 scripts/enrich_tools.py --existing-csv data/tools_cleaned.csv --out-csv audit/new_tools_verified.csv

# 3) Build final dataset + enriched XLSX
python3 scripts/build_dataset.py \
  --audit-csv audit/tools_with_audit.csv \
  --new-tools-csv audit/new_tools_verified.csv \
  --out-dir data \
  --xlsx-out All_ai_tools_cleaned_enriched.xlsx \
  --drop-mismatch-score 0.0
```

## Architecture

- Static frontend: `public/`
- Worker API (Workers deploy path): `src/worker.js`
- Pages Functions API (Git auto-deploy path): `functions/api/[[path]].js`
- D1 schema: `migrations/0001_init.sql`

API endpoints:

- `GET /api/health`
- `GET /api/categories`
- `GET /api/tools?q=&category=&page=&pageSize=&sort=`
- `GET /api/tools/:slug`

## Security + performance implemented

- CSP, HSTS, XFO, nosniff, permissions policy.
- Parameterized SQL queries.
- API input validation and page-size caps.
- Basic per-IP rate limiting.
- Responsive UI with debounced filters and URL-state sync.
- Cache headers for static assets + API responses.

## Go live on Cloudflare with Git (recommended)

### 1) Push this project to GitHub

```bash
git init
git add .
git commit -m "FindAIDir initial launch"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2) Create D1 database

```bash
wrangler d1 create ai_tools_directory
```

Copy the returned `database_id` into `wrangler.toml`.

### 3) Apply schema + seed

```bash
wrangler d1 migrations apply ai_tools_directory
wrangler d1 execute ai_tools_directory --file=data/seed.sql
```

### 4) Create Cloudflare Pages project

In Cloudflare Dashboard:

1. `Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`
2. Select your GitHub repo
3. Build config:
   - Framework preset: `None`
   - Build command: *(empty)*
   - Build output directory: `public`
4. Add D1 binding in Pages settings:
   - Binding name: `DB`
   - Database: `ai_tools_directory`

Pages will auto-deploy on every push to `main`.

### 5) Connect domain `findaidir.com`

In Pages project -> `Custom domains`:

1. Add `findaidir.com`
2. Add `www.findaidir.com` (optional)
3. Let Cloudflare create DNS records automatically

If your domain is not yet on Cloudflare DNS, first add the zone and update nameservers at registrar, then attach the domain to Pages.

## Optional Worker-only deploy (without Pages Git flow)

```bash
wrangler deploy
```

## Monetization-ready tables

These are already in schema:

- `sponsor_slots`
- `affiliate_links`

Use them for sponsored placements, affiliate routing, and premium listings.
