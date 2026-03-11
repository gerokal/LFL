# London Futsal League (LFL) Website

The official website for the **London Futsal League**, a community futsal organisation operating across multiple venues in London since 2015.

**Live site:** [londonfutsalleague.com](https://www.londonfutsalleague.com)

## About

LFL organises competitive futsal leagues and casual games in London, currently running at:
- **Brixton** - (SW2 1QS)
- **North Finchley** - Wren Academy (N12 9HB)

The website provides team and player registration, league standings, match results, media galleries, and general information about futsal.

## Tech Stack

- **[Eleventy](https://www.11ty.dev/) 3.x** - Static site generator with Nunjucks templates
- **[PostCSS](https://postcss.org/)** - CSS processing (autoprefixer + cssnano)
- **[Terser](https://terser.org/)** - JavaScript minification
- **HTML5 / CSS3 / Vanilla JS** - No frontend framework
- **Google Forms** - Backend for form submissions (team registration, solo registration, contact)
- **Apache (.htaccess)** - HTTPS redirect, security headers, caching, compression
- **Lightbox2** - Photo gallery lightbox (media page only)
- **Curator.io** - Social media feed aggregation
- **Wistia** - Video hosting/embedding
- **Font Awesome** - Icons (via Kit JS)
- **Google Fonts** - Ubuntu typeface
- **CookieYes** - Cookie consent banner

## Prerequisites

- [Node.js](https://nodejs.org/) v20+ and npm
- [XAMPP](https://www.apachefriends.org/) (optional, for Apache-based local development)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/gerokal/LFL.git
cd LFL

# Install dependencies
npm install

# Start Eleventy dev server (with hot reload)
npm run serve
```

The dev server will be available at `http://localhost:8080/`.

### Alternative: XAMPP

1. Clone the repository into your XAMPP `htdocs` directory
2. Run `npm run build` to generate the `_site/` output
3. Start Apache in XAMPP
4. Open `http://localhost/LFL/` in your browser

## Project Structure

```
LFL/
├── src/                        # Eleventy source templates
│   ├── _includes/              # Shared Nunjucks partials
│   │   ├── base.njk            # Base layout (assembles all partials)
│   │   ├── head.njk            # <head> contents (meta, CSS, fonts, analytics)
│   │   ├── header.njk          # Header + nav (with active page highlighting)
│   │   ├── footer.njk          # Footer (dynamic copyright year, privacy link)
│   │   └── aside.njk           # Social media feed sidebar
│   ├── index.njk               # Home page
│   ├── about.njk               # About us + contact form
│   ├── solo.njk                # Solo player registration form
│   ├── team.njk                # Team registration form
│   ├── table.njk               # League standings (JSON-driven)
│   ├── results.njk             # Match results archive
│   ├── fixture.njk             # News (placeholder)
│   ├── teams.njk               # Current season team gallery
│   ├── media.njk               # Season photos + league cards
│   ├── free-games.njk          # Free games hosting guide
│   ├── whats-futsal.njk        # What is Futsal? info page
│   ├── 404.njk                 # Custom error page
│   └── privacy.njk             # Privacy policy
├── css/
│   ├── home.css                # Main stylesheet (CSS custom properties)
│   ├── tables.css              # Table / standings styles
│   ├── forms.css               # Form styles
│   └── media.css               # Gallery styles
├── scripts/
│   ├── main.js                 # Footer copyright + service worker registration
│   ├── hamburger.js            # Mobile nav toggle (vanilla JS, ARIA)
│   ├── standings.js            # League table data fetching (fetch API, XSS-safe)
│   ├── submit-solo.js          # Solo form submission handler
│   ├── submit-team.js          # Team form submission handler
│   ├── submit-contact.js       # Contact form submission handler
│   ├── cvalidation.js          # Contact form validation
│   ├── svalidation.js          # Solo form validation
│   └── tvalidation.js          # Team form validation
├── data/
│   ├── lfl-standings-a.json    # South division standings
│   ├── lfl-standings-b.json    # North division standings
│   └── lfl-scorers.json        # Top scorers
├── img/                        # Images, logos, and team badges
├── _site/                      # Build output (git-ignored)
├── docs/
│   ├── AUDIT-REPORT.md         # Full codebase audit findings
│   ├── IMPLEMENTATION-PLAN.md  # Phased modernisation plan
│   ├── GUIDE.md                # Development, build, deploy & maintenance guide
│   └── TECHNICAL.md            # Complete technical reference
├── .eleventy.js                # Eleventy configuration
├── postcss.config.js           # PostCSS configuration (autoprefixer + cssnano)
├── build-js.js                 # Terser JS minification script
├── package.json                # npm project config and scripts
├── .htaccess                   # Apache: HTTPS, security headers, caching
├── robots.txt                  # Search engine crawling rules
├── sitemap.xml                 # Sitemap for search engines
├── manifest.json               # PWA web app manifest
├── sw.js                       # Service worker (offline caching)
├── .gitignore                  # Git ignore rules
├── CLAUDE.md                   # AI assistant context file
└── v0/ - v1/                   # Archived previous versions (git-ignored)
```

## npm Scripts

| Command | Description |
|---|---|
| `npm run build` | Full production build (HTML + CSS + JS) |
| `npm run build:html` | Build HTML pages with Eleventy |
| `npm run build:css` | Process CSS with PostCSS (autoprefixer + cssnano) |
| `npm run build:js` | Minify JavaScript with Terser |
| `npm run serve` | Start Eleventy dev server with hot reload |

## Pages

| Page | Source | URL | Description |
|---|---|---|---|
| Home | `src/index.njk` | `/` | Hero video, CTAs for registration |
| About | `src/about.njk` | `/about.html` | About LFL, mission/vision, contact form |
| Solo Registration | `src/solo.njk` | `/solo.html` | Individual player sign-up |
| Team Registration | `src/team.njk` | `/team.html` | Team sign-up |
| Standings | `src/table.njk` | `/table.html` | League table (data from JSON) |
| Results | `src/results.njk` | `/results.html` | Match results by matchweek |
| News | `src/fixture.njk` | `/fixture.html` | News (placeholder) |
| Teams | `src/teams.njk` | `/teams.html` | Gallery of current season teams |
| Season Info | `src/media.njk` | `/media.html` | Photos and upcoming league details |
| Free Games | `src/free-games.njk` | `/free-games.html` | Guide on hosting free futsal games |
| What is Futsal? | `src/whats-futsal.njk` | `/whats-futsal.html` | Educational content about futsal |
| Privacy Policy | `src/privacy.njk` | `/privacy.html` | GDPR privacy policy |
| 404 | `src/404.njk` | `/404.html` | Custom error page |

## Data Files

League standings and top scorers are stored as JSON in `data/`:
- `lfl-standings-a.json` - South division table
- `lfl-standings-b.json` - North division table
- `lfl-scorers.json` - Top scorers list

These are fetched client-side by `scripts/standings.js` and rendered into the standings page with XSS-safe HTML escaping.

## Documentation

- [CLAUDE.md](CLAUDE.md) - AI assistant context and project conventions
- [docs/AUDIT-REPORT.md](docs/AUDIT-REPORT.md) - Comprehensive codebase audit findings
- [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) - Phased modernisation plan
- [docs/GUIDE.md](docs/GUIDE.md) - Full development, build, deployment, and maintenance guide
- [docs/TECHNICAL.md](docs/TECHNICAL.md) - Complete technical reference (architecture, APIs, CSS, JS, data schemas)

## Modernisation Status

A comprehensive audit and modernisation effort was completed in March 2026. Key improvements include:

- **Templating**: Migrated from 10+ copy-pasted HTML files to Eleventy with shared Nunjucks partials
- **Security**: XSS fix in standings.js, security headers in `.htaccess`, sensitive files blocked
- **Performance**: jQuery removed, Font Awesome deduplicated, CSS/JS minification pipeline
- **SEO**: Meta descriptions, Open Graph tags, favicon, robots.txt, sitemap.xml on all pages
- **Accessibility**: Skip-to-content links, ARIA attributes on nav/hamburger, keyboard navigation
- **GDPR**: Cookie consent on all pages, privacy policy page, analytics deferred until consent
- **PWA**: Web app manifest, service worker for offline caching
- **Code quality**: Dead files removed, `.gitignore` added, unified navigation, typos fixed

See [docs/AUDIT-REPORT.md](docs/AUDIT-REPORT.md) for the full audit and [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) for the implementation plan.

## Affiliated

London Futsal League is affiliated to the [Amateur Football Alliance](https://www.amateur-fa.com).

## Contact

- **Email:** contact@londonfutsalleague.com
- **Instagram:** [@londonfutsalleague](https://www.instagram.com/londonfutsalleague/)
- **Facebook:** [LondonFutsalLeague](https://www.facebook.com/LondonFutsalLeague/)
- **Twitter:** [@LondonFutsalLe](https://twitter.com/LondonFutsalLe)
