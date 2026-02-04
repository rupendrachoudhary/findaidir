# AI Tools Directory

## Project Description
This project is an AI tools directory, designed to help users discover various AI solutions. It's built as a static Next.js website, optimized for performance and SEO. The directory lists numerous AI tools and categorizes them, with features to generate sitemaps for search engine indexing.

## Technologies Used
*   **Next.js:** React framework for building server-side rendered and statically generated web applications.
*   **TypeScript:** Superset of JavaScript that adds static types.
*   **Node.js:** JavaScript runtime used for build scripts and server-side operations during development.
*   **Git:** Version control system.
*   **Cloudflare Pages:** Hosting platform for static sites, automatically deploys from Git repositories.

## High-Level Project Structure

-   `src/app/`: Contains the Next.js application pages and routes (e.g., homepage, tool listings, category pages, static pages like about, contact).
-   `src/components/`: Reusable UI components.
-   `src/data/`: Stores JSON data for tools and categories (`tools.json`, `categories.json`, `metadata.json`).
-   `src/lib/`: Utility functions and helper modules.
-   `src/types/`: TypeScript type definitions.
-   `public/`: Static assets like images, `robots.txt`, and `sitemap.xml`.
-   `scripts/`: Contains utility scripts for data processing, sitemap generation, etc.
-   `out/`: Output directory for the static export of the Next.js application.

## Setup and Installation

To get this project running locally:

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd ai-tools-directory
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` in your browser to see the application.
4.  **Build for production:**
    ```bash
    npm run build
    npm run export
    ```
    This will generate the static files in the `out/` directory.

## Key Scripts

-   `scripts/generate-sitemap.js`: This Node.js script reads `src/data/tools.json` and `src/data/categories.json` to generate the `public/sitemap.xml` file. It includes `lastmod`, `changefreq`, and `priority` for each URL.
-   `scripts/backfill-dates.js`: A utility script to manage the `dateAdded` field in `tools.json`. It assigns a baseline date to older entries and the current date to specific new tools. (Note: A temporary `update-dates.js` was used for a one-time mass update.)

## SEO and Indexing Notes

This project has been set up with SEO best practices in mind:

-   **Sitemap Generation:** The `generate-sitemap.js` script ensures that `sitemap.xml` is always up-to-date with current URLs and `lastmod` dates, crucial for search engine discovery.
-   **Canonical Tags:** Explicit canonical tags are set for all pages using Next.js metadata, preventing duplicate content issues.
-   **Robots.txt:** The `public/robots.txt` allows all user-agents to crawl the site, explicitly disallowing only the `/api/` path.
-   **Static Export:** The site is exported as static HTML, which is highly performant and easily crawlable by search engines.

**Important for Indexing:**
After any significant updates to content or URL structure, it is crucial to:
1.  **Re-run `npm run build` and `npm run export`** to regenerate the `sitemap.xml` and update static files.
2.  **Push changes to your Git repository** (e.g., `main` branch).
3.  **Ensure your hosting platform (like Cloudflare Pages) deploys the new build.**
4.  **Resubmit your `sitemap.xml` to Google Search Console** to promptly inform Google about updated content and new pages.

---