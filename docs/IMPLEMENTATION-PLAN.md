6# LFL Website Modernisation -- Implementation Plan

**Created:** March 2026
**Based on:** [AUDIT-REPORT.md](AUDIT-REPORT.md)

## Overview

This plan addresses all issues identified in the audit report across four phases. Each phase is self-contained and builds on the previous one. Tasks within each phase are ordered by dependency so they can be executed sequentially.

**Current state:** 10 standalone HTML pages with copy-pasted headers/footers/nav, 4 CSS files, 10 JS files (several dead/duplicate), 3 JSON data files with stale data, 7 archived version folders shipping to production, jQuery loaded everywhere but barely used, no build tools, no templating, no `.gitignore`.

---

## Phase 1: Critical Fixes (Immediate -- estimated 1 day)

Bugs, security issues, and broken functionality affecting users right now.

---

### Task 1.1: Fix broken `<script2026` tag in index.html

**Description:** Line 121 of `index.html` has `<script2026` instead of `<script`. This typo prevents the Wistia video embed script from loading.

**Files to modify:**

- `index.html` (line 121)

**Steps:**

1. Change `<script2026` to `<script` on line 121
2. Verify the closing `></script>` on line 124 is correct

**Acceptance criteria:**

- Wistia video embed loads and plays in the hero section
- No console errors related to Wistia scripts

---

### Task 1.2: Sanitise JSON output in standings.js (XSS fix)

**Description:** `standings.js` builds HTML via string concatenation from JSON values without sanitisation. The top scorers section injects an `<img src=...>` tag directly from JSON. If data files are compromised, this allows stored XSS.

**Files to modify:**

- `scripts/standings.js`

**Steps:**

1. Create a helper function `escapeHTML(str)` that replaces `&`, `<`, `>`, `"`, `'` with HTML entities; handle `null`/`undefined` by returning empty string
2. Wrap every `value.X` interpolation in the table builders (lines 15-24, 44-53) with `escapeHTML()`
3. For the top scorers `<img>` tag (line 74), use `escapeHTML()` on `value.Pic` and wrap `src` in quotes: `<img src="` + escapeHTML(value.Pic) + `">`
4. Also wrap `value.Player`, `value.Goals`, `value.Team` (lines 75-77) with `escapeHTML()`
5. Handle `null` entries in `lfl-scorers.json` -- skip entries where `value.Player` is `null`, or display a placeholder

**Acceptance criteria:**

- Standings tables render correctly on `table.html`
- Top scorers shows placeholder for null entries (not literal "null")
- Inject `<script>alert(1)</script>` into a JSON field temporarily; confirm it renders as escaped text

---

### Task 1.3: Fix phone input types

**Description:** Phone fields use `type="number"`, which strips leading zeros, shows spinners, and rejects `+` prefix.

**Files to modify:**

- `solo.html` (line 95)
- `team.html` (line 184)

**Steps:**

1. Change `type="number"` to `type="tel"` on the phone `<input>` in both files
2. Optionally add `pattern="[\+]?[\d\s\-]{10,15}"` for basic validation

**Acceptance criteria:**

- Phone fields show no increment/decrement spinners
- Users can type leading zeros and `+` prefix
- `required` attribute still enforces non-empty

---

### Task 1.4: Fix form action/fetch URL mismatch in team registration

**Description:** `team.html` form `action` URL (line 71) points to one Google Forms endpoint, but `submit-team.js` (line 18) submits via `fetch()` to a completely different endpoint. Since JS calls `preventDefault()`, the form action never fires, but if JS fails the wrong endpoint is used.

**Files to modify:**

- `team.html` (line 71)
- `scripts/submit-team.js` (line 18)

**Steps:**

1. Determine which Google Forms endpoint is correct (check Google Forms dashboard)
2. Update both the `<form action>` and the `fetch()` URL to use the same endpoint
3. Remove `target="hidden_iframe"` from the team form (no hidden iframe exists on this page)

**Acceptance criteria:**

- Test team submission arrives in the correct Google Form
- `<form action>` URL matches the `fetch()` URL
- No `target="hidden_iframe"` on team form

---

### Task 1.5: Remove iframe redirect to google.com in contact form

**Description:** `about.html` line 137 has `onload="if(submitted) {window.location='https://www.google.com';}"`. After form submission, users are redirected away from the site.

**Files to modify:**

- `about.html` (lines 130-138)

**Steps:**

1. Refactor to use the same `fetch()` pattern as `submit-solo.js` / `submit-team.js`:
   - Remove the hidden iframe entirely
   - Remove the `var submitted = false;` script
   - Remove `target="hidden_iframe"` from the form
   - Create `scripts/submit-contact.js` modelled on `submit-solo.js`
   - Load it from `about.html`
2. Show the existing `#confirmation` div on success

**Acceptance criteria:**

- Submit the contact form; user stays on the LFL site
- Success message appears
- Form data still reaches the Google Forms endpoint

---

### Task 1.6: Unify navigation across all pages

**Description:** At least 3 different navigation structures exist. `index.html` says "SEASON 2026", most pages say "SEASON 2024", `results.html` and `fixture.html` have a completely different nav.

**Files to modify:**

- All 10 root-level HTML files

**Steps:**

1. Define the canonical navigation:
   ```html
   <ul>
     <li><a href="index.html">Home</a></li>
     <li><a href="free-games.html">Free Games</a></li>
     <li><a href="whats-futsal.html">What is Futsal?</a></li>
     <li><a href="teams.html">Teams</a></li>
     <li><a href="media.html">Season 2026</a></li>
     <li><a href="about.html">About</a></li>
   </ul>
   ```
2. Copy this nav into every HTML file, setting `class="active"` on the current page's link
3. Unify the footer structure: use the `index.html` pattern (with `main.js` dynamic year) on all pages
4. Remove hardcoded years ("2020", "2022", "2023") from all footers

**Acceptance criteria:**

- All pages show identical menu items in the same order
- Correct page highlighted with `class="active"`
- No page references "2023" or "2024" in nav links
- Footer shows dynamic current year on all pages

---

### Task 1.7: Fix all typos

**Files to modify:**

- `solo.html` line 156: "Trank" -> "Thank"
- `team.html` line 233: "Trank" -> "Thank"
- `team.html` line 99: "wheter" -> "whether"
- `results.html` line 909: "Winnver" -> "Winner"
- `media.html` line 71: "Claphan" -> "Clapham"
- `scripts/cvalidation.js` line 55: "Pleaase" -> "Please"

**Steps:** Open each file and correct the single word. Do NOT modify `v0/` - `v1/` directories.

**Acceptance criteria:** Grep for each typo across root-level files; zero matches found.

---

## Phase 2: Performance & SEO (Short Term -- estimated 2-3 days)

---

### Task 2.1: Remove duplicate Font Awesome 4.7 CSS

**Description:** Every page loads Font Awesome 4.7.0 via stackpath CDN AND the FA Kit via JS. The Kit alone is sufficient.

**Files to modify:** All 10 root-level HTML files

**Steps:**

1. Remove the `<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />` from every HTML file
2. Keep the `<script src="https://kit.fontawesome.com/f40b0e79f9.js">` line

**Acceptance criteria:**

- All FA icons render on every page
- Only one FA network request (the Kit JS) in DevTools
- No missing icon squares

---

### Task 2.2: Remove jQuery dependency

**Description:** jQuery 3.5.1 (290KB unminified) is loaded on every page but used only for the hamburger toggle (6 inline lines) and `standings.js`. Both are trivially replaceable.

**Files to modify:**

- All 10 root-level HTML files
- `scripts/standings.js` (full rewrite)
- `scripts/hamburger.js` (overwrite with vanilla JS)

**Steps:**

1. Overwrite `scripts/hamburger.js` with vanilla JS:
   ```javascript
   document.addEventListener("DOMContentLoaded", function () {
     var toggle = document.querySelector(".toggle");
     var nav = document.querySelector("nav");
     toggle.addEventListener("click", function () {
       toggle.classList.toggle("active");
       nav.classList.toggle("active");
     });
   });
   ```
2. In every HTML file: remove `<script src="https://code.jquery.com/jquery-3.5.1.js"></script>`
3. In every HTML file: remove the inline `<script>` with `$(document).ready(...)` hamburger code
4. In every HTML file: add `<script src="/scripts/hamburger.js"></script>` before `</body>`
5. Rewrite `standings.js` using `fetch()` and DOM APIs instead of `$.getJSON`/`$.each`. Incorporate `escapeHTML` sanitisation from Task 1.2.
6. Replace all `var` with `const`/`let` in the rewritten file

**Acceptance criteria:**

- No jQuery loaded on any page (verify in DevTools Network tab)
- Hamburger menu works on all pages at mobile widths
- Standings and top scorers render correctly on `table.html`
- ~290KB saved per page load

---

### Task 2.3: Add lazy loading to images

**Files to modify:**

- `media.html` (gallery images)
- `teams.html` (team card images)
- `whats-futsal.html` (card images)
- `about.html` (mission image, affiliates image)

**Steps:**

1. Add `loading="lazy"` to every `<img>` tag below the fold
2. Do NOT add it to header logos or hero content (above the fold)
3. Remove empty `srcset=""` attributes from `whats-futsal.html`

**Acceptance criteria:**

- DevTools Network: images below fold don't load until scrolled into view
- No broken images
- No empty `srcset` attributes remain

---

### Task 2.4: Add meta descriptions, Open Graph tags, and favicon

**Files to modify:** All 10 root-level HTML files

**Steps:**

1. Add to every page's `<head>`:
   ```html
   <meta name="description" content="[page-specific, 120-160 chars]" />
   <meta property="og:title" content="[page title]" />
   <meta property="og:description" content="[same as meta description]" />
   <meta
     property="og:image"
     content="https://www.londonfutsalleague.com/img/lfl-og.jpg"
   />
   <meta
     property="og:url"
     content="https://www.londonfutsalleague.com/[page].html"
   />
   <meta property="og:type" content="website" />
   <link rel="icon" type="image/svg+xml" href="/img/lfl.svg" />
   ```
2. Write unique descriptions per page, e.g.:
   - index.html: "London Futsal League - Competitive futsal in Brixton and North Finchley. Register your team or join as a solo player for the 2026 season."
   - about.html: "About London Futsal League - our mission, vision, and history since 2015. Contact us to learn more about futsal in London."
3. Create a 1200x630px OG image from the LFL logo
4. Improve `<title>` tags: "London Futsal League | Home" instead of "LFL | Home"

**Acceptance criteria:**

- Favicon appears in browser tab on all pages
- OG tags validate via opengraph.xyz or Facebook Sharing Debugger
- Every page has a unique `<meta name="description">`

---

### Task 2.5: Create robots.txt and sitemap.xml

**Files to create:**

- `robots.txt`
- `sitemap.xml`

**Steps:**

1. Create `robots.txt`:
   ```
   User-agent: *
   Allow: /
   Disallow: /v0/
   Disallow: /v0.1/
   Disallow: /v0.2/
   Disallow: /v0.3/
   Disallow: /v0.4/
   Disallow: /v0.5/
   Disallow: /v1/
   Disallow: /data/
   Sitemap: https://www.londonfutsalleague.com/sitemap.xml
   ```
2. Create `sitemap.xml` listing all 10 pages with `<lastmod>` and `<priority>` values

**Acceptance criteria:**

- Both files accessible at their root URLs
- Valid XML in sitemap
- Google Search Console can parse the sitemap after deployment

---

### Task 2.6: Add security headers to .htaccess

**Files to modify:** `.htaccess`

**Steps:** Add after the existing HTTPS rewrite:

```apache
# Security Headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

# Block sensitive files
<FilesMatch "\.(docx|txt|bmp)$">
  Require all denied
</FilesMatch>

# Disable directory listing
Options -Indexes
```

**Acceptance criteria:**

- Security headers present in DevTools response headers
- `data/futsal.docx` returns 403
- Directory browsing returns 403
- CSS/JS served with gzip encoding

---

### Task 2.7: Block access to archived version folders

**Files to modify:** `.htaccess`

**Steps:**

1. Add: `RedirectMatch 404 ^/v[0-9]`
2. Add `v0*/` and `v1/` to `.gitignore` (created in Phase 3)

**Acceptance criteria:**

- `http://localhost/LFL/v0/` and `http://localhost/LFL/v1/index.html` return 404
- Folders preserved in git history

---

### Task 2.8: Migrate from Universal Analytics to GA4

**Files to modify:** `index.html` (lines 11-24), plus add to all other pages

**Steps:**

1. Obtain GA4 measurement ID (`G-XXXXXXXXXX`)
2. Replace UA script block with GA4 snippet
3. Add GA4 snippet to all pages (not just index.html)
4. Ensure CookieYes consent fires before analytics

**Acceptance criteria:**

- GA4 Realtime report shows pageviews
- No UA scripts remain
- Analytics present on all pages

---

### Task 2.9: Clean up dead/duplicate JavaScript files

**Files to delete:**

- `scripts/submit-form.js` (exact duplicate of `submit-solo.js`)
- `scripts/media.js` (empty file)

**Files to clean:**

- `scripts/svalidation.js` (remove ~87 lines of commented-out code)

**Steps:**

1. Grep for `submit-form.js` in all HTML files to confirm no references
2. Delete `submit-form.js` and `media.js`
3. Remove `<script src="scripts/media.js">` from `media.html`
4. Remove all commented-out code from `svalidation.js`

**Acceptance criteria:**

- No dead JS files in `scripts/`
- No `<script>` tags pointing to deleted files
- No console errors on any page

---

## Prerequisites for Phase 3: Tooling Setup

Before Phase 3, install and configure the following:

### P1: Install Node.js and npm

- Install Node.js LTS (v20+)
- Verify: `node --version` and `npm --version`

### P2: Initialise npm project

- `npm init -y` in the LFL root directory

### P3: Install Eleventy

- `npm install --save-dev @11ty/eleventy`
- Create `.eleventy.js` config

### P4: Install CSS/JS tooling

- `npm install --save-dev postcss autoprefixer cssnano postcss-cli`
- `npm install --save-dev terser`
- Optionally: `npm install --save-dev sharp` for image processing

### P5: Create `.gitignore`

```
node_modules/
_site/
dist/
.DS_Store
*.log
v0/
v0.1/
v0.2/
v0.3/
v0.4/
v0.5/
v1/
data/futsal.docx
data/NextSeason.txt
.vscode/
```

### P6: Add npm scripts to package.json

```json
{
  "scripts": {
    "build": "eleventy",
    "serve": "eleventy --serve",
    "css:build": "postcss css/*.css --dir _site/css",
    "js:build": "terser scripts/*.js --output _site/scripts/"
  }
}
```

---

## Phase 3: Architecture Modernisation (Medium Term -- estimated 1-2 weeks)

---

### Task 3.1: Create `.gitignore` and clean up repository

**Steps:**

1. Create `.gitignore` with contents from P5
2. `git rm --cached .vscode/settings.json`
3. `git rm --cached data/futsal.docx data/NextSeason.txt`
4. Commit

**Acceptance criteria:** `git status` no longer tracks `.vscode/`, archived versions, or data docs

---

### Task 3.2: Set up Eleventy for templating

**Description:** Extract the duplicated header, nav, footer, aside, and `<head>` into shared Nunjucks partials.

**Files to create:**

- `.eleventy.js`
- `src/_includes/base.njk` (base layout)
- `src/_includes/header.njk`
- `src/_includes/footer.njk`
- `src/_includes/aside.njk`
- `src/_includes/head.njk`
- Convert all 10 HTML files to `src/*.njk` with front matter

**Steps:**

1. Create directory structure: `src/`, `src/_includes/`, `src/_data/`
2. Create `.eleventy.js` with passthrough copies for `img/`, `css/`, `scripts/`, `data/`, `.htaccess`
3. Extract common `<head>` into `head.njk`
4. Extract header+nav into `header.njk` with variable-based `class="active"`:
   ```html
   <a href="/" {% if page.url="" ="/" %}class="active" {% endif %}>Home</a>
   ```
5. Extract footer into `footer.njk`
6. Create `base.njk` assembling all partials around a `{% block content %}` block
7. Convert each HTML page to `.njk` with front matter:
   ```
   ---
   layout: base.njk
   title: "London Futsal League | Home"
   description: "Competitive futsal in Brixton and North Finchley..."
   ---
   ```
8. Test with `npx eleventy --serve`

**Acceptance criteria:**

- `npm run build` generates `_site/` with all HTML pages
- Navigation identical on every generated page
- Changing nav in `header.njk` propagates to all pages on rebuild
- Pages render identically to current static versions

---

### Task 3.3: Set up CSS build pipeline

**Files to create/modify:**

- Create `postcss.config.js`
- Fix `css/forms.css` line 75: `font-size: 200` -> `font-size: 200%`
- Refactor `css/home.css`: replace float layout with flexbox, remove `.clearfix`

**Steps:**

1. Create PostCSS config with autoprefixer + cssnano
2. Fix invalid `font-size: 200` in `forms.css`
3. Replace header float layout with flexbox in `home.css`
4. Remove `.clearfix` CSS rules and all `<div class="clearfix">` from templates
5. Rename `.cuerpo` to `.page-wrapper` (update CSS and templates)
6. Add CSS build step to Eleventy pipeline

**Acceptance criteria:**

- CSS autoprefixed and minified in `_site/css/`
- No invalid CSS properties
- Header uses flexbox, no float/clearfix
- All pages render correctly

---

### Task 3.4: Bundle and minify JavaScript

**Steps:**

1. Replace all `var` with `const`/`let` in source JS files
2. Use terser to minify each JS file during build
3. Consider consolidating the three form scripts into a single configurable `form-handler.js`

**Acceptance criteria:**

- All JS in `_site/scripts/` is minified
- No `var` declarations in source
- All scripts function after minification
- Total JS payload reduced 40%+

---

### Task 3.5: Add ARIA attributes, keyboard navigation, and skip links

**Files to modify:**

- `src/_includes/header.njk`
- `src/_includes/base.njk`
- `scripts/hamburger.js`
- `css/home.css`
- All form page templates

**Steps:**

1. Add skip-to-content link as first `<body>` element (visually hidden, visible on focus)
2. Add `id="main-content"` to `<main>` on every page
3. Convert hamburger `<div class="toggle">` to `<button>` with `aria-label` and `aria-expanded`
4. Add `aria-label="Main navigation"` to `<nav>`
5. Add `rel="noopener noreferrer"` and screen-reader "(opens in new tab)" text to external links
6. Add `aria-live="polite"` to `.errors` containers
7. Add `aria-describedby` linking inputs to `.form-placeholder` text
8. Add focus indicators:
   ```css
   :focus-visible {
     outline: 3px solid var(--primary);
     outline-offset: 2px;
   }
   ```

**Acceptance criteria:**

- Tab through page: skip link appears, hamburger focusable, all elements reachable
- Screen reader announces nav, form labels, error messages
- `aria-expanded` toggles on hamburger
- Lighthouse Accessibility score 90+

---

## Phase 4: UX Enhancements (Longer Term -- estimated 2-3 weeks)

---

### Task 4.1: Create 404 error page

**Files to create:** `src/404.njk`
**Files to modify:** `.htaccess`

**Steps:**

1. Create `404.njk` using base layout with friendly message, LFL logo, links to key pages
2. Add `ErrorDocument 404 /404.html` to `.htaccess`

**Acceptance criteria:** Non-existent URLs show custom 404 page with working navigation

---

### Task 4.2: Optimise images (WebP, compression, naming) ✅ COMPLETED

**Steps:**

1. Create build script using `sharp`:
   - Convert JPG/PNG to WebP (quality 80)
   - Generate thumbnails (300px wide) for gallery use
2. Rename files: replace spaces with hyphens, lowercase (e.g., `london galaxy.jpeg` -> `london-galaxy.webp`)
3. Delete `IFE.bmp` (or convert to WebP)
4. Update `<img>` tags to use `<picture>` with WebP + fallback
5. Add descriptive `alt` text to all images (many have `alt=""`)

**Acceptance criteria:**

- ✅ No BMP files remain (deleted `IFE.bmp` from `img/` and `img/players/`)
- ✅ All gallery images have WebP versions (30 WebP files generated)
- ✅ Thumbnails used in grids (12 gallery thumbnails at 300x200px)
- ✅ Total image payload reduced 50%+ (achieved 66% reduction: 6.6MB → 2.3MB)

**Implementation details:**
- `build-img.js` created using Sharp, integrated as `npm run build:img`
- 13 team logos renamed to lowercase-hyphenated format
- 32 `<picture>` elements with WebP `<source>` + original fallback
- `width`/`height` attributes added to all 35 `<img>` tags to prevent CLS
- Gallery uses thumbnail WebP in grid, full-size WebP in lightbox links

---

### Task 4.3: Fix responsive hero and mobile layout

**Files to modify:** `css/home.css`, `css/media.css`

**Steps:**

1. Fix hero: keep overlay on mobile, do NOT hide venue info
2. Use CSS Grid for team cards with consistent heights:
   ```css
   .team-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
     gap: 1.5rem;
   }
   ```
3. Add second breakpoint at ~480px for small phones
4. Replace all `&nbsp;`, empty `<p>`, and `<br>` spacers with CSS margins

**Acceptance criteria:**

- Hero correct on mobile (320px, 375px, 414px)
- Venue info visible at all sizes
- Team cards uniform height
- No `&nbsp;` used for layout

---

### Task 4.4: Implement GDPR compliance

**Steps:**

1. Move CookieYes script to shared `head.njk` (all pages)
2. Defer analytics until cookie consent granted
3. Fix GDPR text: "not a third parties" -> "not shared with third parties"
4. Create `privacy.html` with full privacy policy
5. Link to privacy policy from all form GDPR notices and footer

**Acceptance criteria:**

- Cookie banner on every page
- Analytics only fires after consent
- Privacy policy linked from footer and forms

---

### Task 4.5: Add PWA support

**Files to create:** `manifest.json`, `sw.js`, PNG icons at 192px and 512px

**Steps:**

1. Create manifest with LFL branding and theme colour `#00aefd`
2. Generate PNG icons from SVG logo
3. Add manifest link and theme-color meta to shared head
4. Create basic service worker caching CSS/JS/SVG for offline shell
5. Register service worker from `main.js`

**Acceptance criteria:**

- Lighthouse PWA audit detects manifest
- "Add to Home Screen" available on mobile
- Site shell loads offline

---

## Files Modified Most Across All Phases

| File                   | Tasks                        |
| ---------------------- | ---------------------------- |
| All 10 HTML files      | 1.6, 2.1, 2.2, 2.3, 2.4, 2.8 |
| `.htaccess`            | 2.6, 2.7, 4.1                |
| `scripts/standings.js` | 1.2, 2.2                     |
| `css/home.css`         | 3.3, 3.5, 4.3                |
| `css/forms.css`        | 3.3                          |
| `scripts/hamburger.js` | 2.2, 3.5                     |
| `scripts/main.js`      | 4.5                          |

---

## Key Starting Points

- **`index.html`** -- Broken script tag (1.1), nav reference (1.6), GA migration (2.8), template model for Eleventy base layout (3.2)
- **`scripts/standings.js`** -- XSS fix (1.2), jQuery-to-vanilla rewrite (2.2), most complex JS file
- **`.htaccess`** -- Security headers (2.6), archived folder blocking (2.7), 404 page (4.1), caching/compression
- **`css/home.css`** -- Invalid CSS fix (3.3), float-to-flexbox (3.3), focus styles (3.5), mobile fixes (4.3)
- **`about.html`** -- Iframe redirect bug (1.5), hardcoded 2020 footer (1.6), contact form -- reference for "form page with sidebar" pattern
