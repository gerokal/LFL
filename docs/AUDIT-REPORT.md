# LFL Website - Comprehensive Audit Report

**Date:** March 2026
**Scope:** Full codebase analysis of the London Futsal League website
**Stack:** Static HTML, CSS, vanilla JavaScript, jQuery, Google Forms backend

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [UX/UI Issues](#3-uxui-issues)
4. [Performance](#4-performance)
5. [Security](#5-security)
6. [SEO](#6-seo)
7. [Accessibility (a11y)](#7-accessibility)
8. [Code Quality & Maintainability](#8-code-quality--maintainability)
9. [Content & Data Issues](#9-content--data-issues)
10. [Recommendations Summary](#10-recommendations-summary)

---

## 1. Executive Summary

The LFL website is a multi-page static site for a London-based futsal league. It was built incrementally over several years (archived versions v0 through v1 still ship in the repo). The site suffers from **stale content**, **duplicated code across every page**, **no build tooling**, **poor accessibility**, and **several security concerns** around form handling. Modernising it will require addressing structural, performance, and UX issues comprehensively.

### Critical Issues (Must Fix)
- XSS vulnerability in standings.js (unsanitised JSON rendered as HTML)
- Broken `<script2026` tag in index.html (typo breaking video embed)
- Inconsistent navigation across pages (results.html and fixture.html use a different nav)
- No favicon, no meta descriptions, no Open Graph tags on any page
- Forms submit to multiple different Google Forms endpoints with mismatched field names
- jQuery 3.5.1 loaded on every page but only used for hamburger toggle and standings
- All archived versions (v0 - v1 folders) ship to production adding significant weight

### High Priority
- No responsive images (no srcset, no lazy loading, no compression pipeline)
- Duplicate header/footer/nav across all 10+ HTML files (no templating)
- Hardcoded year values in most footers (only index.html and a few pages use JS)
- Phone number fields use `type="number"` (strips leading zeros, shows spinners)
- Missing HTTPS redirect for all assets (mixed content risk)

---

## 2. Architecture Overview

### File Structure (current / root-level)
```
LFL/
  index.html            # Home page
  about.html            # About + contact form
  teams.html            # Team cards gallery
  team.html             # Team registration form
  solo.html             # Solo player registration form
  media.html            # Season photos + league info cards
  free-games.html       # Free games hosting guide
  whats-futsal.html     # "What is Futsal?" informational page
  table.html            # League standings (fetched from JSON)
  results.html          # Past match results (hardcoded HTML tables)
  fixture.html          # News page (empty/placeholder)
  .htaccess             # HTTPS redirect only
  css/
    home.css            # Main stylesheet (555 lines, all pages)
    tables.css          # Table styles
    forms.css           # Form styles
    media.css           # Photo gallery styles
  scripts/
    main.js             # Footer copyright year
    hamburger.js        # Unused legacy hamburger toggle
    standings.js        # jQuery - fetches JSON, renders standings
    submit-team.js      # Fetch-based team form submission
    submit-solo.js      # Fetch-based solo form submission
    submit-form.js      # Duplicate of submit-solo.js
    cvalidation.js      # Contact form validation
    svalidation.js      # Solo form validation (87 + 87 lines of commented code)
    tvalidation.js      # Team form validation
    media.js            # Empty file
  data/
    lfl-standings-a.json
    lfl-standings-b.json
    lfl-scorers.json    # Contains null entries
  img/                  # Unoptimised images (JPG, PNG, BMP, SVG)
  video/                # Embedded video page
  v0/ v0.1/ v0.2/ v0.3/ v0.4/ v0.5/ v1/  # Archived old versions
```

### External Dependencies
| Dependency | Version | Purpose | Issue |
|---|---|---|---|
| jQuery | 3.5.1 | Hamburger menu + standings | Outdated; overkill for usage |
| Font Awesome (stackpath) | 4.7.0 | Icons (legacy) | Loaded alongside FA Kit = double load |
| Font Awesome Kit | Latest | Icons | Redundant with above |
| Google Fonts (Ubuntu) | N/A | Typography | Render-blocking |
| Lightbox2 | 2.11.3 | Media gallery lightbox | Only needed on media.html |
| Wistia | N/A | Video embed | Broken script tag |
| Curator.io | N/A | Social media feed | Loaded on every page |
| CookieYes | N/A | Cookie consent | Only on index.html |
| Facebook SDK | v13.0 | Messenger chat plugin | Only on index.html, outdated |

---

## 3. UX/UI Issues

### 3.1 Navigation Inconsistencies
- **index.html** nav: Home, Free Games, What is Futsal?, Teams, SEASON 2026, About
- **about.html, teams.html, solo.html, free-games.html, whats-futsal.html** nav: same but says "SEASON 2024"
- **results.html** nav: Home, NEWS, Fixtures/Results, Table, Teams, NEW SEASON 2023, About (completely different)
- **fixture.html** nav: Home, NEWS, Fixtures/Results, Table, Teams, NEW SEASON 2023, About
- **table.html** nav: includes Table link but other pages comment it out

**Impact:** Users navigating between pages see different menu items appear and disappear, causing confusion.

### 3.2 Stale Content
- The home page says "NEW SEASON from January 2026" but most other pages still reference "SEASON 2024" or even "2023"
- Footer copyright shows different years: "2020", "2022", "2023" hardcoded across pages (only index.html, team.html, and solo.html use the dynamic JS)
- Results page contains data from Sept-Dec 2022 season only
- Standings data in JSON files is from 2022
- Top scorers JSON has `null` entries for positions 3 and 4
- teams.html says "Season 2024" while showing 2024 teams
- The fixture.html page is essentially empty ("coming soon")

### 3.3 Form UX Problems
- **Phone fields use `type="number"`** - this strips leading zeros (e.g., UK numbers starting with 0), shows increment/decrement spinners, and doesn't support `+` for international prefixes. Should be `type="tel"`.
- **No inline validation feedback** - errors only appear after submit as a single concatenated string
- Confirmation message on contact form says "Thank you..." but the `onload` handler on the hidden iframe redirects to google.com: `onload="if(submitted) {window.location='https://www.google.com';}"` - user is taken away from the site
- **Typo in confirmation**: "Trank you for registering" (team.html:233 and solo.html:156)
- solo.html loads both `svalidation.js` AND `submit-solo.js` which both listen for submit events - potential double handling
- team.html `<form>` action URL differs from the fetch URL in `submit-team.js` (form action goes to one Google Form, JS submits to a different one)
- The contact form on about.html uses a hidden iframe + POST approach while team/solo forms use fetch with no-cors - inconsistent patterns

### 3.4 Mobile Experience
- Hero title overlay becomes `position: relative` on mobile, which breaks the overlay design
- The hero section hides the third paragraph (venue info) on mobile via `display: none` - important info lost
- Team card images have no consistent sizing, causing layout jumps
- The `clearfix` hack is used for layout instead of modern CSS

### 3.5 Missing Pages / Dead Links
- `fixture.html` is essentially an empty page
- `results.html` has a navigation that doesn't match other pages
- No 404 error page
- The media page links to `https://www.londonfutsalleague.com/team.html` (absolute URL to production) instead of using relative paths

---

## 4. Performance

### 4.1 Render-Blocking Resources
Every page loads the following in `<head>` before any content renders:
1. CookieYes script (index.html only)
2. Google Analytics (index.html only, using deprecated UA tracking)
3. `home.css` (local)
4. Google Fonts CSS (external, render-blocking)
5. Font Awesome 4.7.0 CSS (stackpath CDN)
6. Font Awesome Kit JS
7. jQuery 3.5.1 (full unminified version - 290KB)

**Total blocking resources per page: 4-7 external requests before first paint.**

### 4.2 Redundant / Duplicate Resources
- **Font Awesome loaded twice**: once via stackpath CSS (v4.7.0) and once via Kit JS (latest). The Kit alone is sufficient.
- **jQuery loaded but barely used**: only for the hamburger toggle (6 lines) and standings page. The hamburger can be done in vanilla JS (15 lines max). The standings fetch can use native `fetch()`.
- **Curator.io script** loads on every page regardless of whether the social feed sidebar is visible or useful.
- `hamburger.js` file exists in scripts/ but is never loaded - the hamburger logic is inline in each HTML file.
- `submit-form.js` is an exact duplicate of `submit-solo.js`.
- `media.js` is an empty file.

### 4.3 Image Optimisation
- No `srcset` or `sizes` attributes for responsive images
- No `loading="lazy"` on any images
- Images are served in original format (JPG, PNG, BMP) - no WebP/AVIF
- Team logos have spaces in filenames (e.g., `london galaxy.jpeg`, `Rush Hour fc.png`) - requires URL encoding
- A `.bmp` file exists (`IFE.bmp`) - extremely inefficient format
- No image compression pipeline
- Gallery thumbnails on media.html are full-size images scaled down via CSS `max-width: 200px`

### 4.4 Archived Versions Bloat
Folders `v0/`, `v0.1/`, `v0.2/`, `v0.3/`, `v0.4/`, `v0.5/`, `v1/` contain complete copies of the site from previous iterations. These ship to production and add significant disk/transfer weight. They should be removed from the deployment (preserved in git history).

### 4.5 No Caching / Compression Headers
- `.htaccess` only handles HTTPS redirect
- No `Cache-Control`, `Expires`, or `ETag` headers configured
- No gzip/brotli compression enabled
- No asset fingerprinting or cache-busting

---

## 5. Security

### 5.1 XSS Vulnerability in standings.js
```javascript
team += '<td class="p-pic"><img src='+ value.Pic + '></td>';
team += '<td class="player">' + value.Player + '</td>';
```
JSON values are interpolated directly into HTML without sanitisation. If the JSON data contains malicious content (e.g., `"Player": "<img src=x onerror=alert(1)>"`), it will execute arbitrary JavaScript. The JSON is fetched from a local file, so risk is lower, but any compromise of the data files would lead to stored XSS.

**Fix:** Use `textContent` / DOM APIs instead of string concatenation, or sanitise values before injection.

### 5.2 Form Handling Issues
- The about.html contact form targets a hidden iframe and sets `submitted = true` as a global variable - this is a fragile pattern
- Forms submit to Google Forms endpoints - no CSRF protection, no rate limiting
- The `no-cors` fetch mode means the response is opaque and errors cannot be detected - the form always shows "success" even if submission fails
- Personal data (name, email, phone, address, DOB) is collected and sent to Google Forms with only a brief GDPR notice - no link to a privacy policy, no cookie consent on non-index pages

### 5.3 Missing Security Headers
The `.htaccess` only handles HTTPS redirect. Missing:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS)

### 5.4 Exposed Internal Files
- `data/futsal.docx` and `data/NextSeason.txt` are publicly accessible
- `img/.BridgeSort` file is exposed
- All archived versions are accessible
- `.vscode/settings.json` is accessible

### 5.5 Broken HTTPS
- `index.html` line 121: `<script2026` - this is a broken tag (typo: the year "2026" was appended to the tag name), so the Wistia media script doesn't load

### 5.6 Third-Party Risk
- Facebook SDK v13.0 is outdated
- CookieYes, Curator.io, Wistia all load third-party scripts with no Subresource Integrity (SRI) hashes
- Google Analytics uses deprecated Universal Analytics (UA-xxxx) instead of GA4

---

## 6. SEO

### 6.1 Missing Meta Tags
No page has:
- `<meta name="description">`
- `<meta name="keywords">`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter Card tags
- Canonical URL (`<link rel="canonical">`)
- Structured data (JSON-LD schema for SportsOrganization, SportsEvent)

### 6.2 Missing Technical SEO
- No `robots.txt` file
- No `sitemap.xml`
- No `favicon.ico` or `<link rel="icon">`
- No `manifest.json` for PWA support
- Title tags are generic: "LFL | Home", "LFL | About Us" - not descriptive for search

### 6.3 Heading Hierarchy Issues
- `whats-futsal.html` has `<h4>` inside cards without preceding `<h3>` in some contexts
- Multiple `<h1>` elements are semantically fine in HTML5 but search engines prefer a single `<h1>`
- Hero section on index.html has `<h1>London Futsal League` - good, but lacks supporting metadata

### 6.4 Image SEO
- Many images have empty `alt=""` attributes (media.html gallery, whats-futsal.html cards)
- `srcset=""` (empty) attributes on whats-futsal.html images - should be removed
- Image filenames use spaces and mixed case, poor for URL consistency

### 6.5 URL Structure
- No clean URLs (pages end in `.html`)
- Mix of relative (`solo.html`) and absolute paths (`/solo.html`) used inconsistently
- Some links point to production domain (`https://www.londonfutsalleague.com/team.html`) instead of relative paths

---

## 7. Accessibility

### 7.1 Keyboard Navigation
- Hamburger menu toggle is a `<div class="toggle">` with no `role="button"`, no `tabindex`, no `aria-label`, no keyboard event handler - completely inaccessible to keyboard users
- Social media links open in new tabs (`target="_blank"`) without warning text for screen reader users
- No skip-to-content link

### 7.2 ARIA & Semantic HTML
- `<nav>` is present but lacks `aria-label` for multiple nav contexts
- Form inputs lack `aria-describedby` for helper text
- Error messages are not announced via `aria-live` regions
- The `<address>` tag is misused in form labels (it's for contact info of the page author, not general addresses)
- `<br>` tags used for spacing instead of CSS margins

### 7.3 Colour Contrast
- Light blue links (`--primary: #00aefd`) on white background may fail WCAG AA contrast ratio (4.5:1 required)
- Error messages use `rgba(230, 20, 20, 0.8)` with white text - should verify contrast
- Footer text is white on `--primary` blue - likely passes but should be verified

### 7.4 Focus Management
- No visible focus indicators beyond browser defaults
- After form submission errors, focus management is minimal (only first error field gets focus)
- No focus trapping in mobile navigation overlay

---

## 8. Code Quality & Maintainability

### 8.1 No Templating / Component Reuse
The header, navigation, footer, aside (social feed), and all external resource links are copy-pasted across all 10+ HTML files. Any change (like updating the nav) must be made in every file manually, which has already led to inconsistencies (see Section 3.1).

**Recommendation:** Adopt a static site generator (Eleventy, Astro, Hugo) or at minimum use HTML includes/partials.

### 8.2 Inline Scripts
Every page contains an inline `<script>` block for the jQuery hamburger toggle right after the header. This is identical across all pages and should be externalised.

### 8.3 CSS Issues
- Global `* { margin: 0; padding: 0; }` reset is aggressive - should use a proper reset/normalise
- `float: left/right` used for layout (header logo + nav) instead of flexbox/grid
- `.clearfix` hack still in use
- Spanish naming: `.cuerpo` (body wrapper) - inconsistent with English class names
- CSS has no minification
- `font-size: 200` in forms.css line 75 is invalid CSS (missing unit)
- No CSS custom property usage for breakpoints (single `768px` breakpoint, hardcoded)

### 8.4 JavaScript Issues
- `var` used throughout standings.js (should be `let`/`const`)
- `jsonURL` variable redeclared with `var` three times in standings.js
- `svalidation.js` contains ~87 lines of commented-out duplicate code
- `submit-form.js` is an exact copy of `submit-solo.js` - dead code
- `media.js` is empty
- `hamburger.js` is never loaded (inline jQuery used instead)
- `submit-solo.js` line 31 uses `fname.value` as a global/implicit reference - fragile
- No module system, no bundling, no minification

### 8.5 HTML Issues
- Duplicate `id="table-fixture"` used on every matchweek table in results.html (IDs must be unique)
- `&nbsp;` used extensively for spacing instead of CSS
- Empty `<p>` tags used as spacers
- `<br>` tags used for vertical spacing
- Comments in Spanish ("Copiar desde aqui", "Inicio Week 1") mixed with English

### 8.6 Version Control
- 7 archived version folders (v0 through v1) tracked in git and deployed
- `.vscode/settings.json` is tracked
- No `.gitignore` file
- `data/futsal.docx` and `data/NextSeason.txt` are in the repo

---

## 9. Content & Data Issues

### 9.1 Stale / Incorrect Data
- Top scorers JSON has `null` values for players 3 and 4
- Standings data is from 2022
- The home page says January 2026 season but most pages say 2024
- "Winnver B" typo in results.html line 909
- "Claphan" typo in media.html line 71 (should be "Clapham")
- "wheter" typo in team.html line 99
- "Pleaase" typo in cvalidation.js line 55

### 9.2 GDPR Compliance
- GDPR notice mentions data won't be shared with "a third parties" (grammatical error + vague)
- No link to a full privacy policy
- CookieYes consent banner only on index.html but cookies/analytics may be set on other pages
- Google Analytics (where present) fires before cookie consent

---

## 10. Recommendations Summary

### Phase 1 - Critical Fixes (Immediate)
| # | Issue | File(s) | Effort |
|---|---|---|---|
| 1 | Fix broken `<script2026` tag | index.html:121 | 5 min |
| 2 | Sanitise JSON output in standings.js | scripts/standings.js | 1 hr |
| 3 | Unify navigation across all pages | All HTML files | 2 hrs |
| 4 | Change phone inputs from `type="number"` to `type="tel"` | solo.html, team.html | 10 min |
| 5 | Fix form action/fetch URL mismatch in team registration | team.html, submit-team.js | 30 min |
| 6 | Remove iframe redirect to google.com in contact form | about.html:137 | 10 min |
| 7 | Fix typos ("Trank", "Winnver", "Claphan", "wheter", "Pleaase") | Various | 30 min |

### Phase 2 - Performance & SEO (Short Term)
| # | Issue | Effort |
|---|---|---|
| 8 | Remove jQuery dependency; rewrite hamburger + standings in vanilla JS | 3 hrs |
| 9 | Remove duplicate Font Awesome 4.7 CSS (keep Kit only) | 30 min |
| 10 | Add meta descriptions, OG tags, favicon, robots.txt, sitemap.xml | 3 hrs |
| 11 | Add `loading="lazy"` to images | 1 hr |
| 12 | Optimise images (WebP, compress, proper naming) | 4 hrs |
| 13 | Remove archived v0-v1 folders from deployment | 1 hr |
| 14 | Add security headers to .htaccess | 1 hr |
| 15 | Migrate from UA to GA4 | 1 hr |

### Phase 3 - Architecture Modernisation (Medium Term)
| # | Issue | Effort |
|---|---|---|
| 16 | Adopt a static site generator (Eleventy/Astro) for templating | 1-2 days |
| 17 | Implement CSS build pipeline (PostCSS/Sass, autoprefixer, minification) | 4 hrs |
| 18 | Bundle and minify JavaScript | 2 hrs |
| 19 | Replace Google Forms with a proper backend or serverless form handler | 1 day |
| 20 | Add ARIA attributes, keyboard navigation, skip links | 1 day |
| 21 | Implement a proper design system with consistent components | 2-3 days |
| 22 | Add a .gitignore, clean up repo | 1 hr |

### Phase 4 - UX Enhancements (Longer Term)
| # | Issue | Effort |
|---|---|---|
| 23 | Design a responsive, modern UI | 1-2 weeks |
| 24 | Add dark mode support | 1 day |
| 25 | Create a proper CMS for managing seasons, teams, results | 1-2 weeks |
| 26 | Add PWA support (manifest, service worker) | 1 day |
| 27 | Implement proper GDPR compliance (privacy policy, consent management) | 1-2 days |
| 28 | Add 404 page and proper error handling | 2 hrs |

---

*Report generated as part of the LFL website modernisation initiative.*
