# LFL Website - Technical Documentation

**Last updated:** March 2026
**Version:** 2.0 (post-modernisation)

This document provides an exhaustive technical reference for every component of the London Futsal League website. It covers the full architecture, every file, every function, every CSS selector, every data schema, and all integration points.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Build Pipeline](#2-build-pipeline)
3. [Eleventy Templating System](#3-eleventy-templating-system)
4. [HTML Pages Reference](#4-html-pages-reference)
5. [CSS Reference](#5-css-reference)
6. [JavaScript Reference](#6-javascript-reference)
7. [Data Layer](#7-data-layer)
8. [Form System](#8-form-system)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [Server Configuration](#10-server-configuration)
11. [Progressive Web App](#11-progressive-web-app)
12. [SEO Implementation](#12-seo-implementation)
13. [Accessibility Implementation](#13-accessibility-implementation)
14. [Security Implementation](#14-security-implementation)
15. [Asset Inventory](#15-asset-inventory)
16. [Dependency Graph](#16-dependency-graph)
17. [Known Limitations](#17-known-limitations)

---

## 1. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       Source Files                               │
│                                                                 │
│  src/*.njk ──────► Eleventy ──────► _site/*.html                │
│  src/_includes/                                                 │
│                                                                 │
│  css/*.css ──────► PostCSS ───────► _site/css/*.css              │
│                    (autoprefixer                                │
│                     + cssnano)                                  │
│                                                                 │
│  scripts/*.js ───► Terser ────────► _site/scripts/*.js           │
│                    (build-js.js)                                │
│                                                                 │
│  img/, data/, .htaccess, ─────────► _site/ (passthrough copy)   │
│  manifest.json, robots.txt,                                     │
│  sitemap.xml, sw.js                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Apache Web Server
                    (HTTPS, headers,
                     caching, gzip)
                              │
                              ▼
                       Browser Client
                    (SW registration,
                     fetch JSON data,
                     form submissions)
```

### Request Flow

1. Browser requests a page (e.g., `/table.html`)
2. Apache serves the static HTML file from `_site/`
3. `.htaccess` enforces HTTPS, sets security/caching headers, enables gzip
4. Browser parses HTML, loads CSS from `_site/css/`, loads JS from `_site/scripts/`
5. `hamburger.js` initialises the mobile nav toggle
6. `main.js` sets the footer copyright year and registers the service worker
7. Page-specific scripts run (e.g., `standings.js` fetches JSON and renders tables)
8. Service worker caches core assets for future offline access

### Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Template engine | Eleventy (11ty) | 3.1.2 | Nunjucks → HTML compilation |
| CSS processing | PostCSS | 8.5.8 | Vendor prefixing + minification |
| CSS plugins | Autoprefixer | 10.4.27 | Vendor prefix injection |
| CSS plugins | cssnano | 7.1.3 | CSS minification |
| JS minification | Terser | 5.46.0 | JavaScript minification |
| Web server | Apache (XAMPP) | 2.4.x | Static file serving |
| Runtime JS | Vanilla JavaScript | ES6+ | DOM manipulation, fetch API |
| Typography | Google Fonts (Ubuntu) | N/A | Web font |
| Icons | Font Awesome Kit | Latest | Icon font |
| Photo gallery | Lightbox2 | 2.11.3 | Image lightbox overlay |
| Social feed | Curator.io | Latest | Social media aggregation |
| Video embed | Wistia | N/A | Video hosting |
| Cookie consent | CookieYes | Latest | GDPR cookie banner |
| Chat | Facebook SDK | v13.0 | Messenger chat plugin |
| Analytics | Google Analytics | UA (legacy) | Page tracking |
| Form backend | Google Forms | N/A | Form data collection |

---

## 2. Build Pipeline

### Configuration Files

#### `.eleventy.js`

```javascript
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy(".htaccess");
  eleventyConfig.addPassthroughCopy("manifest.json");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("sw.js");
  eleventyConfig.addWatchTarget("css/");
  eleventyConfig.addWatchTarget("scripts/");
  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
```

**Key settings:**
- Input directory: `src/` (Nunjucks templates)
- Output directory: `_site/` (compiled HTML)
- Includes directory: `src/_includes/` (partials)
- Passthrough copies: static assets copied verbatim to `_site/`
- Watch targets: `css/` and `scripts/` trigger rebuild on change in dev server

#### `postcss.config.js`

```javascript
module.exports = {
  plugins: [
    require("autoprefixer"),
    require("cssnano")({ preset: "default" }),
  ],
};
```

Autoprefixer injects vendor prefixes based on browserslist defaults. cssnano performs safe minification (whitespace removal, shorthand optimisation, duplicate removal).

#### `build-js.js`

Custom Node.js script that:
1. Reads all `.js` files from `scripts/`
2. Minifies each file individually via Terser
3. Writes the minified output to `_site/scripts/`
4. Logs each processed filename

### npm Scripts

| Script | Command | Description |
|---|---|---|
| `build` | `npm run build:html && npm run build:css && npm run build:js` | Sequential full build |
| `build:html` | `eleventy` | Compile Nunjucks templates to HTML |
| `build:css` | `postcss css/*.css --dir _site/css` | Process and minify CSS |
| `build:js` | `node build-js.js` | Minify JavaScript |
| `serve` | `eleventy --serve` | Dev server with live reload |

### Build Output Structure

```
_site/
├── index.html          (from src/index.njk)
├── about.html          (from src/about.njk)
├── solo.html           (from src/solo.njk)
├── team.html           (from src/team.njk)
├── table.html          (from src/table.njk)
├── results.html        (from src/results.njk)
├── fixture.html        (from src/fixture.njk)
├── teams.html          (from src/teams.njk)
├── media.html          (from src/media.njk)
├── free-games.html     (from src/free-games.njk)
├── whats-futsal.html   (from src/whats-futsal.njk)
├── 404.html            (from src/404.njk)
├── privacy.html        (from src/privacy.njk)
├── css/
│   ├── home.css        (minified)
│   ├── forms.css       (minified)
│   ├── tables.css      (minified)
│   └── media.css       (minified)
├── scripts/
│   ├── main.js         (minified)
│   ├── hamburger.js    (minified)
│   ├── standings.js    (minified)
│   ├── submit-solo.js  (minified)
│   ├── submit-team.js  (minified)
│   ├── submit-contact.js (minified)
│   ├── cvalidation.js  (minified)
│   ├── svalidation.js  (minified)
│   └── tvalidation.js  (minified)
├── img/                (passthrough copy)
├── data/               (passthrough copy)
├── .htaccess           (passthrough copy)
├── manifest.json       (passthrough copy)
├── robots.txt          (passthrough copy)
├── sitemap.xml         (passthrough copy)
└── sw.js               (passthrough copy)
```

---

## 3. Eleventy Templating System

### Template Inheritance

```
base.njk (root layout)
├── head.njk       (inserted into <head>)
├── header.njk     (logo + nav bar)
├── {page content}  (from individual page .njk files)
├── aside.njk      (conditional social feed sidebar)
└── footer.njk     (copyright + contact + privacy link)
```

### `base.njk` - Root Layout

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>{% include "head.njk" %}</head>
  <body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    {{ bodyStartContent | safe }}
    <div class="container">
      <div class="page-wrapper">
        {% include "header.njk" %}
        <main id="main-content" {% if hasAside %}class="grid"{% endif %}>
          {% if hasAside %}<section id="section">{% endif %}
            {{ content | safe }}
          {% if hasAside %}</section>{% include "aside.njk" %}{% endif %}
        </main>
      </div>
      {% include "footer.njk" %}
    </div>
    <!-- Curator.io script (conditional on hasAside) -->
    <!-- extraScriptsBefore loop -->
    <script src="/scripts/hamburger.js"></script>
    <script src="/scripts/main.js"></script>
    <!-- pageScripts loop -->
  </body>
</html>
```

**Conditional logic:**
- `{{ bodyStartContent | safe }}` — raw HTML injected at start of `<body>` (used for Facebook SDK on index page)
- `hasAside` — when true, wraps content in a CSS grid layout with `aside.njk` sidebar and loads Curator.io script
- `extraScriptsBefore` — array of scripts loaded before hamburger.js/main.js
- `pageScripts` — array of scripts loaded after main.js

### `head.njk` - Document Head

**Loads (in order):**
1. CookieYes cookie consent script (all pages)
2. `{{ analyticsScript | safe }}` — conditional analytics code (index page only)
3. `<meta charset>` and `<meta viewport>`
4. `/css/home.css` (base stylesheet)
5. `extraCss` loop (page-specific CSS)
6. Google Fonts (Ubuntu family, all weights)
7. Font Awesome Kit JS
8. `<title>` from front matter
9. `<meta name="description">` from front matter
10. Open Graph tags (conditional on `ogTitle` being set)
11. Favicon (`/img/lfl.svg`)
12. PWA manifest link
13. Theme colour meta tag (`#00aefd`)

### `header.njk` - Navigation

**Elements:**
- Logo: `<a href="/index.html"><img src="/img/lfl.svg">`
- Hamburger: `<button class="toggle" aria-label="Toggle navigation menu" aria-expanded="false">`
- `<nav aria-label="Main navigation">`
- 6 nav links with conditional `class="active"` based on `activePage` front matter variable

**Navigation items:**
| Label | URL | activePage key |
|---|---|---|
| Home | `/index.html` | `home` |
| Free Games | `/free-games.html` | `free-games` |
| What is Futsal? | `/whats-futsal.html` | `whats-futsal` |
| Teams | `/teams.html` | `teams` |
| Season 2026 | `/media.html` | `media` |
| About | `/about.html` | `about` |

### `footer.njk` - Footer

**Contains:**
- LFL logo (small) linked to home
- Dynamic copyright year (set by `main.js`)
- Contact email (`contact@londonfutsalleague.com`)
- Privacy policy link (`/privacy.html`)

### `aside.njk` - Social Feed Sidebar

Displays a Curator.io social media feed widget. The Curator.io script that powers it is loaded conditionally in `base.njk` only when `hasAside: true`.

### Front Matter Variables Reference

| Variable | Type | Default | Description |
|---|---|---|---|
| `layout` | string | — | Always `base.njk` |
| `title` | string | — | `<title>` tag content |
| `description` | string | — | Meta description |
| `ogTitle` | string | — | Open Graph title (also enables all OG tags) |
| `ogDescription` | string | — | Open Graph description |
| `ogUrl` | string | — | Page filename for `og:url` |
| `activePage` | string | `""` | Nav highlight key |
| `hasAside` | boolean | `false` | Include sidebar + Curator.io |
| `extraCss` | string[] | `[]` | Additional CSS files |
| `pageScripts` | string[] | `[]` | Additional JS files (after main.js) |
| `extraScriptsBefore` | string[] | `[]` | Additional JS files (before hamburger.js) |
| `analyticsScript` | string | — | Raw HTML for analytics |
| `bodyStartContent` | string | — | Raw HTML at body start |
| `permalink` | string | — | Output filename |

---

## 4. HTML Pages Reference

### `src/index.njk` → `index.html` (Home)

| Property | Value |
|---|---|
| `activePage` | `home` |
| `hasAside` | `false` |
| `extraCss` | (none) |
| `pageScripts` | (none) |

**Unique features:**
- Google Analytics script (deferred until CookieYes consent)
- Facebook Messenger chat plugin SDK (v13.0)
- Wistia video embed in hero section
- Hero overlay with league name, tagline, season info, and social links
- Two CTA boxes: "Register yourself" → `/solo.html`, "Register your team" → `/team.html`

### `src/about.njk` → `about.html` (About Us)

| Property | Value |
|---|---|
| `activePage` | `about` |
| `hasAside` | `true` |
| `extraCss` | `/css/forms.css` |
| `pageScripts` | `/scripts/submit-contact.js` |

**Content:** About LFL history, mission/vision cards, affiliated organisations (AFA), contact form (`#form-contact`).

**Form fields:** `fname`, `email`, `phone`, `comments`. Google Forms entry IDs in `name` attributes. GDPR notice with privacy policy link.

### `src/solo.njk` → `solo.html` (Solo Registration)

| Property | Value |
|---|---|
| `activePage` | (empty) |
| `hasAside` | `true` |
| `extraCss` | `/css/forms.css` |
| `pageScripts` | `/scripts/submit-solo.js` |

**Form fields:** `fname` (text), `email`, `phone` (tel, pattern validated), `dob` (date), `address` (text), `comments` (textarea with `aria-describedby`). Entry IDs: `entry.2005620554`, `entry.1045781291`, `entry.1065046570`, `entry.1166974658`, `entry.839337160`, `entry.96964123`.

### `src/team.njk` → `team.html` (Team Registration)

| Property | Value |
|---|---|
| `activePage` | (empty) |
| `hasAside` | `true` |
| `extraCss` | `/css/forms.css` |
| `pageScripts` | `/scripts/submit-team.js` |

**Form fields:** Team info (`tname`, `aff`, `kit`, `soc`, `tcb`), primary contact (`pic_name`, `pic_email`, `pic_phone`, `pic_address`), secondary contact (`spic`), description (`tdescription`). Uses `<fieldset>` elements to group team info and contact sections.

### `src/table.njk` → `table.html` (Standings)

| Property | Value |
|---|---|
| `activePage` | (empty) |
| `hasAside` | `true` |
| `extraCss` | `/css/tables.css` |
| `pageScripts` | `/scripts/standings.js` |

**Content:** Three tables — Group A standings (`#table-standings-a`), Group B standings (`#table-standings-b`), Top scorers (`#top-scorers`). Table headers: Position, Team, P, W, D, L, GF, GA, GD, Pts. `<tbody>` content populated dynamically by `standings.js`.

### `src/results.njk` → `results.html` (Results)

| Property | Value |
|---|---|
| `activePage` | (empty) |
| `hasAside` | `true` |
| `extraCss` | `/css/tables.css` |
| `pageScripts` | (none) |

**Content:** Hardcoded HTML tables for each matchweek (Week 1-6). Each table shows: Home team, Score, Away team, Winner (Group A/B). Data is from the Sept-Dec 2022 season.

### `src/fixture.njk` → `fixture.html` (News)

| Property | Value |
|---|---|
| `activePage` | (empty) |
| `hasAside` | `true` |
| `extraCss` | `/css/tables.css` |
| `pageScripts` | (none) |

**Content:** Placeholder page with "Results and fixtures available soon" message.

### `src/teams.njk` → `teams.html` (Teams)

| Property | Value |
|---|---|
| `activePage` | `teams` |
| `hasAside` | `false` |
| `extraCss` | (none) |
| `pageScripts` | (none) |

**Content:** Grid of team cards showing team logo images from `img/TEAMS/2024/`. Each card is a flex item with the team logo and name.

### `src/media.njk` → `media.html` (Season Info)

| Property | Value |
|---|---|
| `activePage` | `media` |
| `hasAside` | `true` |
| `extraCss` | `/css/media.css` |
| `pageScripts` | (none) |
| `extraScriptsBefore` | Lightbox2 JS CDN |

**Content:** League info cards (Clapham Common league, North Finchley league) with schedule, pricing, and venue details. Photo gallery section using Lightbox2 for week-by-week match photos. CTA boxes for solo and team registration.

### `src/free-games.njk` → `free-games.html` (Free Games)

| Property | Value |
|---|---|
| `activePage` | `free-games` |
| `hasAside` | `true` |
| `extraCss` | (none) |
| `pageScripts` | (none) |

**Content:** Guide for hosting free futsal games. Venue options, instructions, and CTA to contact LFL.

### `src/whats-futsal.njk` → `whats-futsal.html` (What is Futsal?)

| Property | Value |
|---|---|
| `activePage` | `whats-futsal` |
| `hasAside` | `false` |
| `extraCss` | (none) |
| `pageScripts` | (none) |

**Content:** Educational content about futsal — rules, history, differences from football. Card-based layout with images. Images have `loading="lazy"`.

### `src/404.njk` → `404.html` (Error Page)

| Property | Value |
|---|---|
| `activePage` | (empty) |
| `hasAside` | `false` |

**Content:** 404 error page with LFL logo, error message, CTA links to Home and Contact.

### `src/privacy.njk` → `privacy.html` (Privacy Policy)

| Property | Value |
|---|---|
| `activePage` | (empty) |
| `hasAside` | `false` |

**Content:** GDPR privacy policy covering: data collected, how data is used, data storage (Google Forms/Sheets), cookies, user rights (access, correction, deletion, portability), contact information.

---

## 5. CSS Reference

### File Structure

| File | Lines | Purpose | Loaded on |
|---|---|---|---|
| `css/home.css` | 690 | Base styles, layout, nav, hero, footer, accessibility, responsive | All pages |
| `css/forms.css` | 117 | Form elements, validation, confirmation, GDPR | about, solo, team |
| `css/tables.css` | 49 | Table layout, standings styles | table, results, fixture |
| `css/media.css` | 14 | Gallery image thumbnails | media |

### `css/home.css` — Full Reference

#### CSS Custom Properties (`:root`)

| Property | Value | Usage |
|---|---|---|
| `--primary` | `#00aefd` | Brand blue — links, buttons, footer, hero overlay |
| `--primary-light` | `#beebff` | Section title backgrounds, CTA hover, league card headers |
| `--primary-dark` | `#0000ff` | CTA box borders |
| `--primary-transparent` | `rgba(0, 174, 253, 0.75)` | Hero overlay background |
| `--secondary` | `#eeeeee` | Aside background |
| `--secondary-dark` | `#dddddd` | Borders, header bottom border, aside title |
| `--secondary-light` | `#f0f0f0` | Body background, footer link colour |
| `--text-dark` | `#363636` | Dark text colour |
| `--shadow` | `0 3px 13px #444444` | Box shadow (defined but used sparingly) |

#### Global Reset

```css
* { margin: 0; padding: 0; }
```

Aggressive universal reset — all elements start with zero margin/padding. Body sets `font-family: "Ubuntu"`, `line-height: 2rem`, `text-align: center`.

#### Layout Structure

| Selector | Layout | Description |
|---|---|---|
| `.container` | `max-width: 1280px; margin: 0 auto` | Page wrapper, white background |
| `.page-wrapper` / `.cuerpo` | `padding: 0 2em` | Content area padding |
| `header` | `display: flex; align-items: center; justify-content: space-between` | Flexbox header |
| `.grid` | `display: grid; grid-template-columns: repeat(6, 1fr); grid-template-areas: "s s s s a a"` | Main + sidebar layout (4:2 ratio) |
| `#section` | `grid-area: s` | Main content area |
| `aside` | `grid-area: a` | Sidebar area |
| `footer` | `display: grid; grid-template-columns: repeat(3, 1fr)` | 3-column footer |
| `.cta` | `display: grid; grid-template-columns: repeat(2, 1fr)` | 2-column CTA layout |

#### Accessibility Styles

| Selector | Purpose |
|---|---|
| `.skip-link` | Hidden skip-to-content link, visible on `:focus` (slides from top) |
| `.sr-only` | Screen reader only text (visually hidden via clip/overflow) |
| `:focus-visible` | Focus indicator: `3px solid var(--primary)`, `2px offset` |

#### Navigation

- `nav ul` — flexbox horizontal list
- `nav ul li a` — uppercase text, `padding: 2.75em 1em`
- `.active` / `:hover` — `border-bottom: 0.1em solid #000000`
- `.toggle` — hidden on desktop, shown at `768px` breakpoint. Uses Font Awesome content (`\f0c9` hamburger, `\f00d` close)

#### Hero Section

- `.hero` — white background, `position: relative`
- `.hero-title-wrapper` — `position: absolute; bottom: 0` overlay with semi-transparent blue background
- `.hero-title` — 80% width, contains h1 and paragraph text
- `.social` — 20% width, positioned top-right with social icons

#### Responsive Breakpoints

**`@media (max-width: 768px)`** — Tablet/mobile:
- Header: adds bottom padding, reduces margin
- `.toggle`: displayed as `2em` block, hamburger icon via `::before` content
- `nav`: hidden by default, `.active` shows it as full-width block
- `.grid`: `display: block` (stacks sidebar below content)
- `.cta`: `display: block` (stacks CTAs)
- `.hero-title-wrapper`: `position: relative` (no longer overlay)
- `footer`: `display: block` (stacks to single column)

**`@media (max-width: 480px)`** — Small phones:
- Hero title: smaller fonts (`1.25em` h1, `0.85em` p)
- Hero wrapper: `flex-direction: column` (stacks title + social)
- Social links: centered, horizontal layout
- CTA boxes: `flex-direction: column`, reduced padding
- Card flex: `grid-template-columns: 1fr` (single column)
- Error page: smaller heading sizes

### `css/forms.css` — Full Reference

| Selector | Description |
|---|---|
| `.contact-form` | Form wrapper, no padding |
| `form .la-in` | Form field group — `padding: 2em`, grey background |
| `form input, form textarea` | Full width, padded |
| `form label` | Left-aligned, floated left |
| `.btn-group` | Button container, centred |
| `.btn-s` | Submit button — light blue background, uppercase, bold |
| `.btn-r` | Reset button — grey background, uppercase, bold |
| `#confirmation` | Success message — hidden by default, green background, `font-size: 200%` |
| `input.error` | Red border on validation error |
| `input:focus` | Green border on focus |
| `.errors .error` | Error messages — red background, white text, click-to-dismiss, `slide-in` animation |
| `.gdpr` | GDPR notice — small font, padded |

### `css/tables.css` — Full Reference

| Selector | Description |
|---|---|
| `table` | Full width, no border/spacing |
| `table td` | Bottom border, `0.5em` padding |
| `tr:hover` | Grey background on hover |
| `th, tfoot td` | Grey background header/footer cells |
| `.team` | Left-aligned team name |
| `.points, .position` | Normal weight |
| `.player p, .goals-f` | Bold weight |

**Mobile (768px):** Hides `.won`, `.draw`, `.lost`, `.goal-f`, `.goal-a`, `.goal-d`, `.captions`, `.p-team`, `.p-pic` columns.

### `css/media.css` — Full Reference

| Selector | Description |
|---|---|
| `.media-gallery img` | `max-width: 200px`, margin, white border, box shadow |
| `.show-gallery` | `display: none` (toggle for gallery sections) |
| `.more-pics` | Small font link text |

---

## 6. JavaScript Reference

### Script Loading Order (per page)

1. `extraScriptsBefore[]` — CDN libraries (e.g., Lightbox2)
2. `/scripts/hamburger.js` — mobile nav (all pages)
3. `/scripts/main.js` — footer year + service worker (all pages)
4. `pageScripts[]` — page-specific scripts

### `scripts/main.js` (9 lines)

**Global scope.** No event listener wrapper.

| Element | Description |
|---|---|
| `document.querySelector(".year")` | Selects the footer `.year` paragraph |
| `.innerHTML = "© " + new Date().getFullYear() + " | London Futsal League"` | Sets dynamic copyright |
| `navigator.serviceWorker.register("/sw.js")` | Registers service worker (feature-detected) |

### `scripts/hamburger.js` (11 lines)

**Event:** `DOMContentLoaded`

| Function | Description |
|---|---|
| (anonymous) | Queries `.toggle` button and `nav` element. On click: toggles `.active` class on both, sets `aria-expanded` attribute. Guards against missing elements with early return. |

**DOM elements:** `.toggle` (button), `nav`
**ARIA:** Sets `aria-expanded="true"` / `"false"` on toggle

### `scripts/standings.js` (65 lines)

**Event:** `DOMContentLoaded`

| Function | Parameters | Description |
|---|---|---|
| `escapeHTML(str)` | `str: any` | Returns empty string for `null`/`undefined`. Escapes `&`, `<`, `>`, `"`, `'` to HTML entities. |
| `buildStandingsRow(value)` | `value: Object` | Builds a `<tr>` string with cells: Position, Team, Played, Won, Drawn, Lost, GF, GA, GD, Points. All values escaped. |
| `loadStandings(url, tableId)` | `url: string, tableId: string` | Fetches JSON from `url`, iterates results, builds HTML rows via `buildStandingsRow()`, injects into `#tableId tbody`. |

**Data fetches:**
- `data/lfl-standings-a.json` → `#table-standings-a`
- `data/lfl-standings-b.json` → `#table-standings-b`
- `data/lfl-scorers.json` → `#top-scorers`

**Null handling:** Scorers with `Player == null` are skipped.
**Security:** All values pass through `escapeHTML()` before DOM insertion.

### `scripts/submit-solo.js` (44 lines)

**Event:** `DOMContentLoaded`

| Element | Description |
|---|---|
| `#form-solo` | Target form element |
| Submit event listener | `preventDefault()`, checks `form.checkValidity()`, collects `FormData`, sends via `fetch()` |

**Google Forms endpoint:** `https://docs.google.com/forms/d/e/1FAIpQLSfxqJkeDSY7fvBuJUS07aeFljI2PpXcZ424Sfwqm6BpJJUabQ/formResponse`
**Method:** POST, `mode: "no-cors"`, Content-Type: `application/x-www-form-urlencoded`
**On success:** `alert()` with personalised thank-you message using `fname.value`, resets form
**On error:** Logs to console
**On invalid:** `alert("Please fill out all required fields.")`

### `scripts/submit-team.js` (44 lines)

Identical pattern to `submit-solo.js`.

**Target form:** `#form-team`
**Google Forms endpoint:** `https://docs.google.com/forms/u/0/d/e/1FAIpQLSf6MdPJsHIGLcL-GVDkmQ7V_H9u0yjBVI7TfwFhAo7fbecNSA/formResponse`
**On success:** Generic thank-you alert, resets form

### `scripts/submit-contact.js` (38 lines)

**Target form:** `#form-contact`
**Google Forms endpoint:** `https://docs.google.com/forms/u/0/d/e/1FAIpQLSe1lwHp8zXZv2KulK9xf5N1teOZ08iFaFXMd_cO-UzPfNBTkQ/formResponse`
**On success:** Shows `#confirmation` div (CSS `display: block`), resets form
**On error:** Logs to console
**On invalid:** `alert("Please fill out all required fields.")`

### `scripts/cvalidation.js` (73 lines)

**No `DOMContentLoaded` wrapper** — runs at parse time.

| Function | Parameters | Description |
|---|---|---|
| `validateRegisterForm(e)` | `e: Event` | Validates `#form-contact` fields: `fname`, `email` (regex), `phone`, `comments`. Returns `false` with error display on failure, shows alert on success. |
| `handle_errors(errs)` | `errs: Array<{text, el}>` | Adds `.error` class to invalid inputs, creates dismissible error message div, focuses first error field. |

**Email regex:** `/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/`

**Error display:** Creates `<div class="error">` with concatenated error text, appends to `.errors` container. Clicking the error removes it.

### `scripts/svalidation.js` (87 lines)

Same pattern as `cvalidation.js`. Target: `#form-solo`.

**Validates:** `fname`, `email` (regex), `phone`, `dob`, `address`, `comments`
**All six fields are required.** On success: alert with personalised message.

### `scripts/tvalidation.js` (106 lines)

Same pattern. Target: `#form-team`.

**Validates:** `tname`, `aff`, `kit`, `soc`, `tcb`, `pic_name`, `pic_email` (regex), `pic_phone`, `pic_address`, `spic`, `tdescription`
**All eleven fields are required.** On success: alert with team name.

### Validation Architecture

Each form page loads two scripts:
1. A **validation script** (`cvalidation.js`, `svalidation.js`, `tvalidation.js`) — attaches a `submit` handler that validates fields and returns `true`/`false`
2. A **submission script** (`submit-contact.js`, `submit-solo.js`, `submit-team.js`) — attaches a second `submit` handler with `preventDefault()` that sends data via `fetch()`

The submission script calls `preventDefault()`, so the form is always handled by JavaScript. The validation script's `return false` prevents further event propagation only when there are errors. Both scripts run on the same submit event.

### `sw.js` — Service Worker (45 lines)

| Event | Description |
|---|---|
| `install` | Opens cache `"lfl-v1"`, caches: `/index.html`, `/css/home.css`, `/scripts/main.js`, `/scripts/hamburger.js`, `/img/lfl.svg` |
| `activate` | Deletes old caches (any cache name ≠ `CACHE_NAME`) |
| `fetch` | Cache-first strategy: returns cached response if available, otherwise fetches from network |

**Cache strategy:** Cache-first with no network fallback update. Assets are cached on install and served from cache indefinitely until the cache name changes.

**To invalidate:** Change `CACHE_NAME` from `"lfl-v1"` to a new value (e.g., `"lfl-v2"`).

---

## 7. Data Layer

### JSON Schema: Standings (`data/lfl-standings-a.json`, `data/lfl-standings-b.json`)

```json
[
  {
    "Position": number,    // League position (1-based)
    "Team": string,        // Team name (uppercase)
    "Played": number,      // Games played
    "Won": number,         // Wins
    "Drawn": number,       // Draws
    "Lost": number,        // Losses
    "GF": number,          // Goals for
    "GA": number,          // Goals against
    "GD": number,          // Goal difference (GF - GA)
    "Points": number       // League points (W*3 + D*1)
  }
]
```

**File A:** South/Clapham division (7 teams in current data)
**File B:** North/Finchley division (5 teams). Note: Position numbers are out of order in current data (1, 2, 4, 3, 5).

### JSON Schema: Scorers (`data/lfl-scorers.json`)

```json
[
  {
    "Position": number,      // Ranking (1-based)
    "Pic": string,           // Path to player photo (relative)
    "Player": string | null, // Player name (null = placeholder)
    "Goals": number | null,  // Total goals scored
    "Team": string | null    // Team name
  }
]
```

**Current data:** 4 entries, positions 3-4 have `null` values (handled by `standings.js` null check).

### Data Flow

```
data/*.json ──► fetch() in standings.js ──► escapeHTML() ──► innerHTML injection ──► Rendered table
```

Data files are served as static JSON by Apache. `standings.js` fetches them client-side on `DOMContentLoaded`, builds HTML strings with sanitised values, and injects into `<tbody>` elements.

---

## 8. Form System

### Form Architecture Overview

```
User fills form
      │
      ▼
[Validation script]          [Submit script]
(cvalidation.js,             (submit-contact.js,
 svalidation.js,              submit-solo.js,
 tvalidation.js)               submit-team.js)
      │                            │
      ▼                            ▼
Validates all fields         preventDefault()
Returns false if errors      Collects FormData
Shows error messages         Sends fetch() POST
      │                      to Google Forms
      │                            │
      ▼                            ▼
If valid, returns true       Shows confirmation
Event continues              Resets form
```

### Google Forms Entry IDs

#### Solo Registration Form (`#form-solo`)

| Field | Input ID | Google Forms Entry |
|---|---|---|
| Full name | `fname` | `entry.2005620554` |
| Email | `email` | `entry.1045781291` |
| Phone | `phone` | `entry.1065046570` |
| Date of birth | `dob` | `entry.1166974658` |
| Post code | `address` | `entry.839337160` |
| Comments | `comments` | `entry.96964123` |

**Endpoint:** `https://docs.google.com/forms/d/e/1FAIpQLSfxqJkeDSY7fvBuJUS07aeFljI2PpXcZ424Sfwqm6BpJJUabQ/formResponse`

#### Team Registration Form (`#form-team`)

| Field | Input ID | Google Forms Entry |
|---|---|---|
| Team name | `tname` | (entry ID in HTML `name` attr) |
| Affiliated | `aff` | (entry ID in HTML `name` attr) |
| Kit colour | `kit` | (entry ID in HTML `name` attr) |
| Social media | `soc` | (entry ID in HTML `name` attr) |
| Competed before | `tcb` | (entry ID in HTML `name` attr) |
| Contact name | `pic_name` | (entry ID in HTML `name` attr) |
| Contact email | `pic_email` | (entry ID in HTML `name` attr) |
| Contact phone | `pic_phone` | (entry ID in HTML `name` attr) |
| Contact address | `pic_address` | (entry ID in HTML `name` attr) |
| Second contact | `spic` | (entry ID in HTML `name` attr) |
| Description | `tdescription` | (entry ID in HTML `name` attr) |

**Endpoint:** `https://docs.google.com/forms/u/0/d/e/1FAIpQLSf6MdPJsHIGLcL-GVDkmQ7V_H9u0yjBVI7TfwFhAo7fbecNSA/formResponse`

#### Contact Form (`#form-contact`)

| Field | Input ID | Google Forms Entry |
|---|---|---|
| Full name | `fname` | (entry ID in HTML `name` attr) |
| Email | `email` | (entry ID in HTML `name` attr) |
| Phone | `phone` | (entry ID in HTML `name` attr) |
| Comments | `comments` | (entry ID in HTML `name` attr) |

**Endpoint:** `https://docs.google.com/forms/u/0/d/e/1FAIpQLSe1lwHp8zXZv2KulK9xf5N1teOZ08iFaFXMd_cO-UzPfNBTkQ/formResponse`

### Input Validation Rules

| Field | Type | Required | Pattern | Validation |
|---|---|---|---|---|
| Full name | `text` | Yes | — | Non-empty |
| Email | `email` | Yes | — | Non-empty + email regex |
| Phone | `tel` | Yes | `[\+]?[\d\s\-]{10,15}` | Non-empty |
| Date of birth | `date` | No (HTML) / Yes (JS) | — | Non-empty (JS) |
| Address | `text` | Yes | — | Non-empty |
| Comments/Description | `textarea` | Yes | — | Non-empty |

### Error Handling

- Validation errors create `<div class="error">` elements appended to `.errors` container
- Error divs are styled with red background, white text, `slide-in` animation
- Clicking an error div removes it from DOM
- First invalid field receives `.focus()`
- Invalid inputs get `.error` CSS class (red border)
- No `aria-live` announced on the `.errors` container in contact form (solo form has `aria-live="polite"`)

---

## 9. Third-Party Integrations

### CookieYes (Cookie Consent)

- **Loaded on:** All pages (via `head.njk`)
- **Script:** `https://cdn-cookieyes.com/client_data/31a19c615b873054bfe455e8/script.js`
- **Purpose:** GDPR cookie consent banner
- **Integration:** Fires `cookieyes_consent_update` event used by analytics

### Google Analytics (Universal Analytics)

- **Loaded on:** `index.html` only (via `analyticsScript` front matter)
- **Tracking ID:** `UA-71227360-1`
- **Deferred:** Waits for `cookieyes_consent_update` event, only loads if `analytics` category is accepted
- **Status:** Uses deprecated UA format (not GA4)

### Facebook Messenger Chat

- **Loaded on:** `index.html` only (via `bodyStartContent` front matter)
- **Page ID:** `452144844968907`
- **SDK version:** `v13.0`
- **Script:** `https://connect.facebook.net/en_GB/sdk/xfbml.customerchat.js`

### Wistia Video

- **Loaded on:** `index.html` hero section
- **Media ID:** `8iz41qe27d`
- **Scripts:** `https://fast.wistia.com/embed/medias/8iz41qe27d.jsonp`, `https://fast.wistia.com/assets/external/E-v1.js`
- **Embed type:** Responsive (padding-top 56.25% aspect ratio)

### Curator.io Social Feed

- **Loaded on:** Pages with `hasAside: true` (about, solo, team, table, results, fixture, free-games, media)
- **Script:** `https://cdn.curator.io/published/2b430e20-754c-44f0-856a-5f7b3f3f9af1.js`
- **Target element:** `#curator-feed-lflfeed-layout`

### Lightbox2

- **Loaded on:** `media.html` only (via `extraScriptsBefore`)
- **CSS:** `https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css`
- **JS:** `https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox.min.js`
- **Usage:** Gallery images wrapped in `<a href="full-size.jpg" data-lightbox="gallery">`

### Font Awesome

- **Loaded on:** All pages (via `head.njk`)
- **Kit:** `https://kit.fontawesome.com/f40b0e79f9.js`
- **Icons used:** `fa-facebook-square`, `fa-instagram-square`, `fa-twitter-square`, `fa-envelope`, `fa-user`, `fa-users`, `fa-home`, `fa-futbol`, plus hamburger/close via CSS content (`\f0c9`, `\f00d`)

### Google Fonts

- **Loaded on:** All pages (via `head.njk`)
- **Font:** Ubuntu (all weights and styles: 300/400/500/700, normal/italic)
- **URL:** `https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap`
- **Loading:** `display=swap` (non-blocking)

---

## 10. Server Configuration

### `.htaccess` — Full Reference

```apache
# HTTPS Enforcement
RewriteEngine On
RewriteCond %{ENV:HTTPS} !on
RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Block archived version folders
RedirectMatch 404 ^/v[0-9]

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

# Custom 404 error page
ErrorDocument 404 /404.html

# Disable directory listing
Options -Indexes
```

### Apache Module Requirements

| Module | Required for |
|---|---|
| `mod_rewrite` | HTTPS redirect |
| `mod_headers` | Security headers |
| `mod_expires` | Cache-Control headers |
| `mod_deflate` | Gzip compression |
| `mod_alias` | RedirectMatch for archived folders |

---

## 11. Progressive Web App

### `manifest.json`

| Property | Value |
|---|---|
| `name` | "London Futsal League" |
| `short_name` | "LFL" |
| `description` | "Competitive futsal in Brixton and North Finchley..." |
| `start_url` | `/index.html` |
| `display` | `standalone` |
| `background_color` | `#ffffff` |
| `theme_color` | `#00aefd` |
| Icons | `/img/lfl-192.png` (192x192), `/img/lfl-512.png` (512x512), `/img/lfl.svg` (any size) |

### Service Worker (`sw.js`)

- **Cache name:** `lfl-v1`
- **Cached assets:** `/index.html`, `/css/home.css`, `/scripts/main.js`, `/scripts/hamburger.js`, `/img/lfl.svg`
- **Strategy:** Cache-first (returns cached if available, falls back to network)
- **Cache cleanup:** On activate, deletes all caches except current `CACHE_NAME`
- **Registration:** `main.js` calls `navigator.serviceWorker.register("/sw.js")` with feature detection

---

## 12. SEO Implementation

### Per-Page Meta Tags

Every page receives (via `head.njk` and front matter):
- `<title>` — "London Futsal League | {Page Name}"
- `<meta name="description">` — unique, 120-160 characters
- `<meta property="og:title">` — same as title (conditional on `ogTitle`)
- `<meta property="og:description">` — same as meta description
- `<meta property="og:image">` — `https://www.londonfutsalleague.com/img/lfl-og.jpg`
- `<meta property="og:url">` — full page URL
- `<meta property="og:type">` — `website`

### Favicon

```html
<link rel="icon" type="image/svg+xml" href="/img/lfl.svg" />
```

### `robots.txt`

Allows all crawlers. Disallows `/v0*/`, `/v1/`, `/data/`. Points to sitemap.

### `sitemap.xml`

Lists 11 pages (all except 404.html) with:
- `<lastmod>`: 2026-03-08
- `<changefreq>`: monthly
- `<priority>`: 1.0 (home), 0.8 (about, solo, team), 0.6 (all others)

---

## 13. Accessibility Implementation

### Skip Link

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```
Visually hidden (`top: -100%`), appears on focus (`top: 0`). Target: `<main id="main-content">`.

### Navigation

- `<button class="toggle" aria-label="Toggle navigation menu" aria-expanded="false">` — keyboard-accessible hamburger
- `<nav aria-label="Main navigation">` — labelled landmark
- `hamburger.js` toggles `aria-expanded` between `"true"` and `"false"`

### Screen Reader Text

External links include: `<span class="sr-only">(opens in new tab)</span>`

### Focus Indicators

```css
:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
}
```

### Form Accessibility

- Solo form has `aria-describedby="comments-help"` linking textarea to help text
- Solo form has `<div class="errors" aria-live="polite">` for announced errors
- Contact and team forms lack `aria-live` on error containers

### External Links

Links with `target="_blank"` include `rel="noopener noreferrer"` (on index.html social links and aside Curator.io link).

---

## 14. Security Implementation

### XSS Prevention

`standings.js` uses `escapeHTML()` on all JSON values before DOM insertion:
- Replaces `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#039;`
- Returns empty string for `null`/`undefined`

### HTTP Security Headers

| Header | Value | Protection |
|---|---|---|
| HSTS | `max-age=31536000; includeSubDomains` | Force HTTPS |
| X-Content-Type-Options | `nosniff` | MIME sniffing prevention |
| X-Frame-Options | `SAMEORIGIN` | Clickjacking prevention |
| Referrer-Policy | `strict-origin-when-cross-origin` | Referrer data leakage |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | Feature restriction |

### File Access Controls

- `.docx`, `.txt`, `.bmp` → 403 Forbidden
- `/v0*/`, `/v1/` → 404 (RedirectMatch)
- Directory listing → 403 (`Options -Indexes`)

### Cookie Consent

Analytics script on index.html defers loading until CookieYes consent is granted for the `analytics` category. The script listens for the `cookieyes_consent_update` custom DOM event.

---

## 15. Asset Inventory

### Images (`img/`)

| Path | Contents |
|---|---|
| `img/lfl.svg` | SVG logo (favicon, header, footer, 404 page) |
| `img/lfl.png` | PNG logo |
| `img/lfl-192.png` | PWA icon 192x192 |
| `img/lfl-512.png` | PWA icon 512x512 |
| `img/player.png` | Default player photo (used in scorers table) |
| `img/mision.jpg` | Mission section image |
| `img/vision-img.jpg` | Vision section image |
| `img/futsal.jpg` | General futsal image |
| `img/IFE.bmp` | BMP image (blocked by .htaccess) |
| `img/IFE.png` | PNG alternative |
| `img/TEAMS/` | Team logo subdirectories by year |
| `img/TEAMS/2023/` | 2023 season team logos |
| `img/TEAMS/2024/` | 2024 season team logos |
| `img/media/league/` | Match day photos |
| `img/media/w1/` - `img/media/w6/` | Photos by matchweek |
| `img/whats-futsal/` | What is Futsal page images |
| `img/players/` | Player photos |
| `img/misc/` | Miscellaneous images |
| `img/exports/` | Exported graphics |

### Data Files (`data/`)

| File | Size | Description |
|---|---|---|
| `lfl-standings-a.json` | ~2KB | South division standings (7 teams) |
| `lfl-standings-b.json` | ~2KB | North division standings |
| `lfl-scorers.json` | ~0.5KB | Top scorers (4 entries, 2 null) |
| `futsal.docx` | — | Internal document (blocked by .htaccess) |
| `NextSeason.txt` | — | Internal notes (blocked by .htaccess) |
| `april 2021/` | — | Archived scorers data from April 2021 |
| `july 2021/` | — | Archived scorers data from July 2021 |

### Documentation (`docs/`)

| File | Description |
|---|---|
| `AUDIT-REPORT.md` | Comprehensive codebase audit (March 2026) |
| `IMPLEMENTATION-PLAN.md` | Phased modernisation plan |
| `GUIDE.md` | Development, build, deploy, and maintenance guide |
| `TECHNICAL.md` | This file — full technical reference |

---

## 16. Dependency Graph

### Page → CSS Dependencies

```
ALL PAGES ──────────────► css/home.css
about.html, solo.html, team.html ──► css/forms.css
table.html, results.html, fixture.html ──► css/tables.css
media.html ─────────────► css/media.css
media.html ─────────────► Lightbox2 CSS (CDN)
```

### Page → JS Dependencies

```
ALL PAGES ──────────────► scripts/hamburger.js
ALL PAGES ──────────────► scripts/main.js
table.html ─────────────► scripts/standings.js
solo.html ──────────────► scripts/submit-solo.js
                           scripts/svalidation.js
team.html ──────────────► scripts/submit-team.js
                           scripts/tvalidation.js
about.html ─────────────► scripts/submit-contact.js
                           scripts/cvalidation.js
media.html ─────────────► Lightbox2 JS (CDN)
```

### JS → Data Dependencies

```
scripts/standings.js ───► data/lfl-standings-a.json
                           data/lfl-standings-b.json
                           data/lfl-scorers.json
```

### JS → External API Dependencies

```
scripts/submit-solo.js ────► Google Forms (1FAIpQLSfx...)
scripts/submit-team.js ────► Google Forms (1FAIpQLSf6...)
scripts/submit-contact.js ─► Google Forms (1FAIpQLSe1...)
scripts/main.js ───────────► /sw.js (service worker registration)
```

### Template Inheritance

```
src/index.njk ──────────► src/_includes/base.njk
src/about.njk ──────────►   ├── src/_includes/head.njk
src/solo.njk ───────────►   ├── src/_includes/header.njk
src/team.njk ───────────►   ├── {page content}
src/table.njk ──────────►   ├── src/_includes/aside.njk (conditional)
src/results.njk ────────►   └── src/_includes/footer.njk
src/fixture.njk ────────►
src/teams.njk ──────────►
src/media.njk ──────────►
src/free-games.njk ─────►
src/whats-futsal.njk ───►
src/404.njk ────────────►
src/privacy.njk ────────►
```

---

## 17. Known Limitations

### Architecture

- No `src/_data/` global data files — all front matter is per-page
- No Eleventy filters or shortcodes used
- CSS and JS build steps are separate from Eleventy (not integrated via Eleventy transforms)
- Service worker caches only 5 core files — most pages require network access

### Performance

- Google Analytics still uses deprecated Universal Analytics (UA) — needs GA4 migration
- No responsive images (`srcset`, `sizes`, `<picture>`)
- No WebP/AVIF image conversion
- Gallery thumbnails are full-size images scaled via CSS `max-width: 200px`
- Image filenames contain spaces and mixed case (require URL encoding)
- `IFE.bmp` still exists in the repo (blocked but not removed)
- Google Fonts loads all 8 weight/style combinations (many unused)
- Font Awesome Kit loads the entire icon set (only ~10 icons used)

### Content

- Results page data is from Sept-Dec 2022 season
- Standings JSON data is from 2022
- Top scorers has 2 null placeholder entries
- `fixture.html` is an empty placeholder page
- Team gallery shows 2024 season teams

### Code Quality

- Validation scripts run at parse time (no `DOMContentLoaded` wrapper) — `cvalidation.js`, `svalidation.js`, `tvalidation.js`
- `submit-solo.js` line 31 uses `fname.value` as an implicit global reference
- Validation and submission scripts both attach to the same submit event — dual handling pattern
- CSS still has both `.cuerpo` and `.page-wrapper` selectors (legacy alias)
- Some inline styles in `privacy.njk` (`style="padding-left: 1.5em"`)
- `&nbsp;`, empty `<p>`, and `<br>` used for spacing in some templates

### Accessibility

- Contact form and team form `.errors` containers lack `aria-live`
- No focus trapping in mobile nav overlay
- Colour contrast of `--primary` (#00aefd) on white may not meet WCAG AA 4.5:1 ratio
- Not all images have descriptive `alt` text (some have `alt=""`)

### Security

- `no-cors` fetch mode means form submission errors are undetectable
- No CSRF protection on forms (relies on Google Forms)
- No Content-Security-Policy header (would require extensive whitelisting of third-party scripts)
- No Subresource Integrity (SRI) hashes on third-party scripts
- Facebook SDK version 13.0 is outdated
