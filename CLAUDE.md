# CLAUDE.md - LFL Website

## Project Overview
Static HTML/CSS/JS website for the London Futsal League, built with Eleventy (11ty) for templating. Runs on Apache (XAMPP locally, production at londonfutsalleague.com). Uses PostCSS for CSS processing and Terser for JS minification.

## Architecture
- **Eleventy static site generator** - Nunjucks templates in `src/`, builds to `_site/`
- **12 pages** defined as `.njk` files in `src/` (10 original + `404.njk` + `privacy.njk`)
- **5 shared partials** in `src/_includes/` (`base.njk`, `head.njk`, `header.njk`, `footer.njk`, `aside.njk`)
- **4 CSS files** in `css/` - processed by PostCSS (autoprefixer + cssnano) into `_site/css/`
- **8 JS files** in `scripts/` - minified by Terser into `_site/scripts/`
- **3 JSON data files** in `data/` - league standings and scorers
- **Archived versions** in `v0/` through `v1/` - legacy, do not modify, blocked by `.htaccess`
- Forms submit to **Google Forms** endpoints via fetch (no-cors)

## Build System
- **Eleventy 3.x** - compiles `src/*.njk` → `_site/*.html`
- **PostCSS** with autoprefixer + cssnano - `css/*.css` → `_site/css/*.css`
- **Terser** via `build-js.js` - `scripts/*.js` → `_site/scripts/*.js`
- **Sharp** via `build-img.js` - converts images to WebP, generates thumbnails for gallery
- **npm scripts**: `npm run build` (full build), `npm run serve` (Eleventy dev server)
- Config: `.eleventy.js`, `postcss.config.js`, `build-js.js`, `build-img.js`

## Key Conventions
- All pages use Nunjucks templates extending `src/_includes/base.njk`
- Page-specific config via front matter (`title`, `description`, `activePage`, `extraCss`, `pageScripts`, etc.)
- Shared header/nav/footer defined once in partials — changes propagate to all pages
- CSS uses custom properties defined in `:root` in `home.css`
- Primary colour: `--primary: #00aefd` (blue)
- Font: Ubuntu (Google Fonts)
- Single breakpoint at `768px` for mobile
- Hamburger menu uses vanilla JS (`scripts/hamburger.js`) with ARIA attributes
- Skip-to-content link on every page for accessibility
- CookieYes cookie consent banner on all pages
- Images use `<picture>` elements with WebP source + original fallback
- All `<img>` tags include `width` and `height` attributes to prevent CLS
- Image filenames are lowercase with hyphens (no spaces or mixed case)

## Template System (Eleventy)
Each page is a `.njk` file in `src/` with front matter:
```yaml
---
layout: base.njk
title: "London Futsal League | Page Name"
description: "Meta description for SEO"
ogTitle: "Open Graph title"
ogDescription: "Open Graph description"
ogUrl: "page.html"
activePage: "page-key"      # highlights correct nav item
hasAside: true/false         # includes social feed sidebar
extraCss: ["/css/forms.css"] # additional CSS files
pageScripts: ["/scripts/standings.js"] # additional JS files
permalink: "page.html"
---
```

## File Relationships
- `src/index.njk` → `index.html` - hero video, CTAs, analytics, Facebook chat
- `src/about.njk` → `about.html` - loads `forms.css`, `cvalidation.js`, `submit-contact.js`
- `src/solo.njk` → `solo.html` - loads `forms.css`, `svalidation.js`, `submit-solo.js`
- `src/team.njk` → `team.html` - loads `forms.css`, `tvalidation.js`, `submit-team.js`
- `src/table.njk` → `table.html` - loads `tables.css`, `standings.js`
- `src/media.njk` → `media.html` - loads `media.css`, lightbox2
- `src/results.njk` → `results.html` - loads `tables.css`
- `src/fixture.njk` → `fixture.html` - loads `tables.css`
- `src/teams.njk`, `src/free-games.njk`, `src/whats-futsal.njk` - base styles only
- `src/404.njk` → `404.html` - custom error page
- `src/privacy.njk` → `privacy.html` - privacy policy (GDPR)

## Scripts
- `scripts/main.js` - dynamic footer copyright year + service worker registration
- `scripts/hamburger.js` - vanilla JS mobile nav toggle with `aria-expanded`
- `scripts/standings.js` - fetches JSON data, renders standings/scorers with XSS-safe `escapeHTML()`
- `scripts/submit-solo.js` - solo registration form submission via fetch
- `scripts/submit-team.js` - team registration form submission via fetch
- `scripts/submit-contact.js` - contact form submission via fetch (replaced iframe pattern)
- `scripts/cvalidation.js` - contact form validation
- `scripts/svalidation.js` - solo form validation
- `scripts/tvalidation.js` - team form validation

## Form Endpoints
- **Solo registration** submits to Google Forms via `scripts/submit-solo.js`
- **Team registration** submits to Google Forms via `scripts/submit-team.js`
- **Contact form** submits to Google Forms via `scripts/submit-contact.js`

## SEO & Web Standards
- Every page has `<meta name="description">` and Open Graph tags (via front matter)
- Favicon: `img/lfl.svg`
- `robots.txt` blocks `/v0*/`, `/v1/`, `/data/` directories
- `sitemap.xml` lists all public pages
- `manifest.json` for PWA support (theme colour `#00aefd`)
- `sw.js` service worker caches core assets for offline shell

## Security
- `.htaccess` enforces HTTPS, sets security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Gzip compression enabled for HTML/CSS/JS/JSON/SVG
- Cache-Control headers for static assets
- Sensitive files (`.docx`, `.txt`, `.bmp`) blocked
- Directory listing disabled
- Archived version folders return 404
- `standings.js` uses `escapeHTML()` to prevent XSS from JSON data

## Testing
No automated test suite. To verify changes:
1. Run `npm run build` to generate `_site/`
2. Start XAMPP Apache
3. Open `http://localhost/LFL/` in browser (serves root files) or use `npm run serve` for Eleventy dev server
4. Test all pages, forms, and mobile responsive layout
5. Check browser console for JS errors

## Deployment
1. Run `npm run build` to generate production files in `_site/`
2. Upload `_site/` contents to production Apache server
3. The `.htaccess` handles HTTPS redirect, security headers, caching, and compression
4. Alternatively, serve root-level HTML files directly (legacy approach without build step)

## Important Paths
- Eleventy templates: `src/*.njk`
- Shared partials: `src/_includes/*.njk`
- Eleventy config: `.eleventy.js`
- PostCSS config: `postcss.config.js`
- JS build script: `build-js.js`
- Image build script: `build-img.js`
- Main stylesheet: `css/home.css`
- Build output: `_site/`
- League data: `data/lfl-standings-*.json`, `data/lfl-scorers.json`
- Team logos: `img/TEAMS/2024/`
- Media photos: `img/media/league/`
- PWA manifest: `manifest.json`
- Service worker: `sw.js`

## Remaining Known Issues
- Google Analytics still uses deprecated Universal Analytics (UA) instead of GA4
- Hero section hides venue info on mobile
- No dark mode support
- `&nbsp;` and empty `<p>` tags still used for spacing in some pages
