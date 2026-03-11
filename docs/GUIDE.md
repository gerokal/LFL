# LFL Website - Development, Build, Deployment & Maintenance Guide

**Last updated:** March 2026

This guide covers everything needed to develop, build, deploy, and maintain the London Futsal League website.

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Development Workflow](#2-development-workflow)
3. [Build System](#3-build-system)
4. [Templating with Eleventy](#4-templating-with-eleventy)
5. [CSS Architecture](#5-css-architecture)
6. [JavaScript Architecture](#6-javascript-architecture)
7. [Forms & Data](#7-forms--data)
8. [SEO & Web Standards](#8-seo--web-standards)
9. [Security](#9-security)
10. [Deployment](#10-deployment)
11. [Maintenance Tasks](#11-maintenance-tasks)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Environment Setup

### Prerequisites

- **Node.js** v20 or higher ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** for version control
- **XAMPP** (optional) for Apache-based local development

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/gerokal/LFL.git
cd LFL

# Install dependencies
npm install
```

This installs:
- `@11ty/eleventy` - Static site generator
- `postcss`, `postcss-cli`, `autoprefixer`, `cssnano` - CSS processing
- `terser` - JavaScript minification

### Verify Installation

```bash
# Check Node.js version (must be 20+)
node --version

# Check npm version
npm --version

# Test build
npm run build
```

If the build succeeds, you should see a `_site/` directory with the compiled HTML, CSS, and JS files.

---

## 2. Development Workflow

### Option A: Eleventy Dev Server (Recommended)

```bash
npm run serve
```

This starts a local dev server at `http://localhost:8080/` with:
- Live reload on template changes (`.njk` files in `src/`)
- Watch mode for CSS and JS source files

**Note:** The Eleventy dev server only watches template files. CSS and JS changes require a manual rebuild (`npm run build:css` or `npm run build:js`) or a full `npm run build`.

### Option B: XAMPP Apache

1. Ensure the repository is cloned into `<XAMPP>/htdocs/LFL/`
2. Run `npm run build` to generate `_site/`
3. Start Apache via XAMPP Control Panel
4. Open `http://localhost/LFL/` in browser

This approach serves the root-level HTML files (which also exist alongside `_site/`). For testing the built output specifically, configure Apache to serve from `_site/`.

### File Editing Workflow

1. **Templates** - Edit `.njk` files in `src/` (never edit `_site/` directly)
2. **Shared components** - Edit partials in `src/_includes/` (changes propagate to all pages)
3. **Stylesheets** - Edit `.css` files in `css/` (source), then run `npm run build:css`
4. **Scripts** - Edit `.js` files in `scripts/` (source), then run `npm run build:js`
5. **Data** - Edit JSON files in `data/` directly
6. **Images** - Add/replace files in `img/` directly

### Adding a New Page

1. Create `src/new-page.njk` with front matter:
   ```yaml
   ---
   layout: base.njk
   title: "London Futsal League | New Page"
   description: "Description for SEO (120-160 characters)"
   ogTitle: "London Futsal League | New Page"
   ogDescription: "Description for Open Graph sharing"
   ogUrl: "new-page.html"
   activePage: "new-page"
   hasAside: false
   permalink: "new-page.html"
   ---

   <h2>Page Content Here</h2>
   ```

2. Add a nav link in `src/_includes/header.njk` if needed:
   ```html
   <li><a href="/new-page.html"{% if activePage == "new-page" %} class="active"{% endif %}>New Page</a></li>
   ```

3. Add the page to `sitemap.xml`
4. Run `npm run build` to generate the page

### Adding Page-Specific CSS or JS

Use front matter arrays:

```yaml
---
extraCss:
  - "/css/forms.css"
  - "/css/custom.css"
pageScripts:
  - "/scripts/my-script.js"
extraScriptsBefore:
  - "https://cdn.example.com/library.js"
---
```

- `extraCss` - loaded in `<head>` after `home.css`
- `pageScripts` - loaded at end of `<body>` after `main.js`
- `extraScriptsBefore` - loaded before `hamburger.js` and `main.js`

---

## 3. Build System

### Build Commands

| Command | What it does |
|---|---|
| `npm run build` | Runs all three build steps in sequence |
| `npm run build:html` | Compiles `src/*.njk` → `_site/*.html` via Eleventy |
| `npm run build:css` | Processes `css/*.css` → `_site/css/*.css` via PostCSS |
| `npm run build:js` | Minifies `scripts/*.js` → `_site/scripts/*.js` via Terser |
| `npm run serve` | Starts Eleventy dev server with hot reload |

### Build Pipeline Details

**HTML (Eleventy)**
- Config: `.eleventy.js`
- Input: `src/` (Nunjucks templates)
- Output: `_site/` (static HTML)
- Passthrough copies: `img/`, `data/`, `.htaccess`, `manifest.json`, `robots.txt`, `sitemap.xml`, `sw.js`

**CSS (PostCSS)**
- Config: `postcss.config.js`
- Plugins: `autoprefixer` (vendor prefixes), `cssnano` (minification)
- Input: `css/*.css`
- Output: `_site/css/*.css`

**JavaScript (Terser)**
- Script: `build-js.js`
- Input: `scripts/*.js`
- Output: `_site/scripts/*.js`
- All source files are individually minified

### Build Output

The `_site/` directory contains the complete, production-ready website:
```
_site/
├── *.html          # All compiled pages
├── css/            # Minified CSS
├── scripts/        # Minified JS
├── img/            # Images (passthrough copy)
├── data/           # JSON data files (passthrough copy)
├── .htaccess       # Apache config (passthrough copy)
├── manifest.json   # PWA manifest
├── robots.txt      # Search engine rules
├── sitemap.xml     # Sitemap
└── sw.js           # Service worker
```

**Important:** The `_site/` directory is git-ignored. Always regenerate it with `npm run build` before deployment.

---

## 4. Templating with Eleventy

### Template Hierarchy

```
base.njk
├── head.njk        (meta tags, CSS, fonts, analytics)
├── header.njk      (logo, navigation, hamburger menu)
├── content          (page-specific content from each .njk file)
├── aside.njk       (social feed sidebar, conditional)
└── footer.njk      (copyright, contact, privacy link)
```

### Front Matter Variables

| Variable | Type | Description |
|---|---|---|
| `layout` | string | Always `base.njk` |
| `title` | string | Page `<title>` tag |
| `description` | string | Meta description for SEO |
| `ogTitle` | string | Open Graph title (enables OG tags when present) |
| `ogDescription` | string | Open Graph description |
| `ogUrl` | string | Page filename for OG URL |
| `activePage` | string | Key for nav active state (`home`, `about`, `teams`, etc.) |
| `hasAside` | boolean | Include social feed sidebar |
| `extraCss` | array | Additional CSS files to load |
| `pageScripts` | array | Additional JS files to load at end of body |
| `extraScriptsBefore` | array | JS files loaded before hamburger.js/main.js |
| `analyticsScript` | string | Raw HTML for analytics scripts |
| `bodyStartContent` | string | Raw HTML inserted at start of `<body>` |
| `permalink` | string | Output filename |

### Conditional Features

- **Social feed sidebar**: Set `hasAside: true` to include `aside.njk` and the Curator.io script
- **Analytics**: Only `index.njk` includes the analytics script (via `analyticsScript` front matter)
- **Facebook chat**: Only `index.njk` includes Facebook SDK (via `bodyStartContent` front matter)

### Modifying Shared Components

To change something that appears on every page (nav links, footer text, meta tags, etc.):

1. Edit the relevant partial in `src/_includes/`
2. Run `npm run build:html` (or `npm run build`)
3. All pages will be regenerated with the change

---

## 5. CSS Architecture

### File Structure

| File | Purpose | Used on |
|---|---|---|
| `css/home.css` | Main stylesheet, CSS custom properties, layout, header/footer/nav | All pages |
| `css/forms.css` | Form-specific styles | about, solo, team |
| `css/tables.css` | Table/standings styles | table, results, fixture |
| `css/media.css` | Photo gallery styles | media |

### CSS Custom Properties

Defined in `:root` in `css/home.css`:

```css
--primary: #00aefd;     /* Brand blue */
--font-family: 'Ubuntu', sans-serif;
```

### Responsive Design

- Single breakpoint at `768px`
- Mobile-first approach for the hamburger menu
- Media queries in each CSS file handle layout changes

### Key CSS Classes

| Class | Purpose |
|---|---|
| `.container` | Page wrapper |
| `.page-wrapper` | Content area (renamed from `.cuerpo`) |
| `.hero` | Home page hero section |
| `.cta` | Call-to-action boxes |
| `.toggle` | Hamburger menu button |
| `.skip-link` | Accessibility skip-to-content link |
| `.grid` | Main content grid (when sidebar is present) |

---

## 6. JavaScript Architecture

### Script Loading Order

On every page (defined in `base.njk`):
1. `extraScriptsBefore` (page-specific, e.g., CDN libraries)
2. `scripts/hamburger.js` - mobile navigation
3. `scripts/main.js` - footer year + service worker
4. `pageScripts` (page-specific, e.g., standings.js)

### Script Descriptions

| Script | Purpose |
|---|---|
| `main.js` | Sets footer copyright year dynamically; registers service worker |
| `hamburger.js` | Vanilla JS mobile nav toggle with `aria-expanded` attribute |
| `standings.js` | Fetches JSON data files, renders standings tables and top scorers with XSS-safe `escapeHTML()` |
| `submit-solo.js` | Handles solo registration form submission via `fetch()` to Google Forms |
| `submit-team.js` | Handles team registration form submission via `fetch()` to Google Forms |
| `submit-contact.js` | Handles contact form submission via `fetch()` to Google Forms |
| `cvalidation.js` | Contact form client-side validation |
| `svalidation.js` | Solo form client-side validation |
| `tvalidation.js` | Team form client-side validation |

### Security: escapeHTML()

`standings.js` includes an `escapeHTML()` function that sanitises all JSON values before inserting them into the DOM. This prevents XSS if data files are ever compromised:

```javascript
function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

---

## 7. Forms & Data

### Form Submission Pattern

All three forms (solo, team, contact) use the same pattern:

1. Client-side validation script checks required fields
2. On valid submission, a `fetch()` request sends data to a Google Forms endpoint using `mode: "no-cors"`
3. A confirmation message is displayed
4. The form is reset

**Important:** Because `mode: "no-cors"` returns an opaque response, errors from Google Forms cannot be detected. The success message always appears if the fetch request doesn't throw.

### Google Forms Endpoints

Each form script (`submit-solo.js`, `submit-team.js`, `submit-contact.js`) contains the Google Forms URL. To update an endpoint:

1. Get the new Google Forms pre-filled URL
2. Extract the form response URL and field entry IDs
3. Update the `fetch()` URL in the corresponding submit script
4. Update the `<form action>` attribute in the corresponding `.njk` template to match
5. Update the `name` attributes on `<input>` elements to match Google Forms entry IDs

### League Data

JSON files in `data/` contain league standings and top scorers. To update:

1. Edit `data/lfl-standings-a.json` (South division)
2. Edit `data/lfl-standings-b.json` (North division)
3. Edit `data/lfl-scorers.json` (top scorers)

The `standings.js` script fetches these client-side. No build step needed — changes are live immediately.

**Data format for standings:**
```json
[
  {
    "Position": 1,
    "Team": "Team Name",
    "Played": 10,
    "Won": 8,
    "Drawn": 1,
    "Lost": 1,
    "GF": 30,
    "GA": 10,
    "GD": 20,
    "Points": 25
  }
]
```

**Data format for scorers:**
```json
[
  {
    "Position": 1,
    "Player": "Player Name",
    "Goals": 15,
    "Team": "Team Name",
    "Pic": "img/path/to/photo.jpg"
  }
]
```

Null entries in the scorers JSON are skipped automatically.

---

## 8. SEO & Web Standards

### Meta Tags

Every page has SEO metadata set via front matter:
- `<title>` - format: "London Futsal League | Page Name"
- `<meta name="description">` - unique per page, 120-160 characters
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)

### Favicon

The site uses an SVG favicon (`img/lfl.svg`), defined in `head.njk`:
```html
<link rel="icon" type="image/svg+xml" href="/img/lfl.svg" />
```

### robots.txt

Blocks search engines from indexing:
- `/v0/` through `/v1/` (archived versions)
- `/data/` (JSON data files)

Points to the sitemap at `https://www.londonfutsalleague.com/sitemap.xml`.

### sitemap.xml

Lists all 11 public pages with `<lastmod>`, `<changefreq>`, and `<priority>` values. Update `<lastmod>` dates when pages change significantly.

### PWA Support

- `manifest.json` - web app manifest with LFL branding and icons
- `sw.js` - service worker that caches core assets (index.html, home.css, main.js, hamburger.js, lfl.svg)
- Service worker registered in `main.js`
- Theme colour: `#00aefd`

To update cached assets, increment the `CACHE_NAME` version in `sw.js` (e.g., `"lfl-v2"`).

---

## 9. Security

### .htaccess Security Headers

The `.htaccess` file sets the following headers:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS for 1 year |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused APIs |

### File Access Controls

- `.docx`, `.txt`, `.bmp` files return 403 Forbidden
- Directory listing disabled (`Options -Indexes`)
- Archived version folders (`/v0*`, `/v1/`) return 404
- Custom 404 error page served for missing URLs

### Caching & Compression

- Images: cached for 1 month
- CSS/JS: cached for 1 week
- Gzip compression for HTML, CSS, JS, JSON, SVG

### Cookie Consent

CookieYes banner loads on every page (via `head.njk`). Google Analytics (on `index.html`) is deferred until the user grants analytics consent via the `cookieyes_consent_update` event.

---

## 10. Deployment

### Production Build

```bash
# Generate production-ready files
npm run build
```

This creates the `_site/` directory with all compiled and minified assets.

### Deploying to Production

The site is deployed as static files on an Apache web server.

**Manual deployment:**

1. Run `npm run build` locally
2. Upload the contents of `_site/` to the web server root
3. Ensure `.htaccess` is included (it handles HTTPS, security headers, caching)

**What to upload:**
```
_site/
├── *.html              # All page files
├── css/                # Minified CSS
├── scripts/            # Minified JS
├── img/                # All images
├── data/               # JSON data files
├── .htaccess           # Apache configuration
├── manifest.json       # PWA manifest
├── robots.txt          # Search engine rules
├── sitemap.xml         # Sitemap
└── sw.js               # Service worker
```

**What NOT to upload:**
- `node_modules/` - development dependencies only
- `src/` - source templates (not needed in production)
- `v0/` through `v1/` - archived versions
- `docs/` - internal documentation
- `.eleventy.js`, `postcss.config.js`, `build-js.js` - build config
- `package.json`, `package-lock.json` - npm config

### DNS & Hosting

- Domain: `londonfutsalleague.com`
- HTTPS is enforced via `.htaccess` rewrite rules
- No CI/CD pipeline currently exists

### Post-Deployment Checklist

1. Verify all pages load without console errors
2. Test navigation on mobile and desktop
3. Test form submissions (solo, team, contact)
4. Verify favicon appears in browser tab
5. Check security headers with browser DevTools (Network > Response Headers)
6. Test 404 page by visiting a non-existent URL
7. Validate robots.txt and sitemap.xml are accessible
8. Test cookie consent banner appears

---

## 11. Maintenance Tasks

### Seasonal Updates

At the start of each new season:

1. **Update season references** in `src/_includes/header.njk` (nav link text, e.g., "Season 2026")
2. **Update standings data** in `data/lfl-standings-*.json` (reset to empty or new season data)
3. **Update top scorers** in `data/lfl-scorers.json`
4. **Update results** in `src/results.njk` (add new matchweek tables)
5. **Update team gallery** in `src/teams.njk` (new team logos in `img/TEAMS/`)
6. **Update home page** season info in `src/index.njk`
7. **Update media page** in `src/media.njk` (new season photos)
8. **Update `sitemap.xml`** `<lastmod>` dates
9. Run `npm run build` and deploy

### Adding Match Results

1. Open `src/results.njk`
2. Add a new matchweek section following the existing pattern
3. Use unique IDs for each table (e.g., `id="table-week-X"`)
4. Run `npm run build:html`

### Adding Team Logos

1. Add the logo image to `img/TEAMS/2024/` (or the appropriate season folder)
2. Use lowercase filenames with hyphens (e.g., `team-name.png`)
3. Update `src/teams.njk` with the new team card
4. Run `npm run build:html`

### Adding Gallery Photos

1. Add photos to `img/media/league/`
2. Update `src/media.njk` with new `<a>` / `<img>` tags inside the gallery grid
3. Add `loading="lazy"` to images below the fold
4. Run `npm run build:html`

### Updating Google Forms Endpoints

If a Google Form is recreated:

1. Get the new form's pre-filled link URL
2. Extract the base response URL and entry field IDs
3. Update the corresponding `scripts/submit-*.js` file with the new URL
4. Update `<input name="entry.XXXXX">` attributes in the `.njk` template
5. Update the `<form action="...">` URL to match
6. Test the submission
7. Run `npm run build:js`

### Updating the Service Worker Cache

When CSS, JS, or other cached assets change:

1. Open `sw.js`
2. Change `CACHE_NAME` to a new version (e.g., `"lfl-v2"`, `"lfl-v3"`)
3. Update the `ASSETS` array if new files need caching
4. Run `npm run build` and deploy

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Or update a specific package
npm install @11ty/eleventy@latest --save-dev
```

After updating, run `npm run build` and test the site thoroughly.

---

## 12. Troubleshooting

### Build Fails

**Eleventy error:**
- Check for syntax errors in `.njk` files (unclosed tags, missing front matter delimiters `---`)
- Verify `.eleventy.js` config is valid
- Run `npx eleventy --dryrun` for diagnostic output

**PostCSS error:**
- Check for invalid CSS syntax in `css/` files
- Verify `postcss.config.js` exists and is valid

**Terser error:**
- Check for JavaScript syntax errors in `scripts/` files
- Run `node build-js.js` directly for error details

### Pages Not Updating

- Ensure you're editing `src/*.njk` files, not `_site/` files
- Run `npm run build` after changes
- Clear browser cache or use incognito mode
- If using service worker, update `CACHE_NAME` in `sw.js`

### Forms Not Submitting

- Check browser console for network errors
- Verify the Google Forms endpoint is still active
- Remember: `no-cors` mode means you can't detect server errors
- Test by submitting and checking the Google Forms response spreadsheet

### Hamburger Menu Not Working

- Verify `scripts/hamburger.js` is loaded (check DevTools Sources tab)
- Ensure `.toggle` button element exists in the rendered HTML
- Check for JavaScript errors in console

### Styles Not Applying

- Check that `css/home.css` is loaded (it's the base stylesheet for all pages)
- Verify page-specific CSS is listed in `extraCss` front matter
- Check for CSS specificity conflicts
- Run `npm run build:css` if changes aren't reflected in `_site/css/`

### 404 Page Not Showing

- Verify `.htaccess` contains `ErrorDocument 404 /404.html`
- Verify `404.html` exists in the build output (`_site/404.html`)
- Apache must have `mod_rewrite` enabled
- XAMPP: ensure `AllowOverride All` is set in Apache config

### Service Worker Issues

- Service workers only work over HTTPS (or `localhost`)
- To force update: open DevTools > Application > Service Workers > "Update on reload"
- To clear cache: DevTools > Application > Storage > "Clear site data"
- Increment `CACHE_NAME` in `sw.js` to invalidate old caches

---

## Remaining Known Issues

These items from the original audit have not yet been addressed:

- **GA4 migration**: Google Analytics still uses Universal Analytics (UA). Migrate to GA4 when a measurement ID is available
- **Image optimisation**: No WebP/AVIF conversion, no responsive `srcset`, no thumbnail generation. Gallery images are full-size scaled via CSS
- **Mobile hero**: Hero section hides venue info on mobile. Consider keeping it visible
- **Spacing hacks**: Some pages still use `&nbsp;`, empty `<p>` tags, and `<br>` for spacing instead of CSS
- **Dark mode**: Not implemented
- **Image naming**: Some files have spaces and mixed case in filenames

See [AUDIT-REPORT.md](AUDIT-REPORT.md) for the complete list and [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) for the original plan.
