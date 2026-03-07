# CLAUDE.md - LFL Website

## Project Overview
Static HTML/CSS/JS website for the London Futsal League. Runs on Apache (XAMPP locally, production at londonfutsalleague.com). No build tools, no framework, no package manager.

## Architecture
- **10 HTML pages** at root level, each is standalone (no templating)
- **4 CSS files** in `css/` - `home.css` is the main shared stylesheet
- **10 JS files** in `scripts/` - mix of vanilla JS and jQuery
- **3 JSON data files** in `data/` - league standings and scorers
- **Archived versions** in `v0/` through `v1/` - legacy, do not modify
- Forms submit to **Google Forms** endpoints via fetch (no-cors) or hidden iframe

## Key Conventions
- All pages share the same header/nav/footer structure (copy-pasted, not templated)
- CSS uses custom properties defined in `:root` in `home.css`
- Primary colour: `--primary: #00aefd` (blue)
- Font: Ubuntu (Google Fonts)
- Single breakpoint at `768px` for mobile
- jQuery 3.5.1 loaded on every page (used minimally)
- Navigation hamburger menu uses inline jQuery in each HTML file

## File Relationships
- `index.html` - loads `home.css`, `main.js`
- `about.html` - loads `home.css`, `forms.css`, `cvalidation.js`, `main.js`
- `solo.html` - loads `home.css`, `forms.css`, `submit-solo.js`, `main.js`
- `team.html` - loads `home.css`, `forms.css`, `submit-team.js`, `main.js`
- `table.html` - loads `home.css`, `tables.css`, `standings.js`, `main.js`
- `media.html` - loads `home.css`, `media.css`, `media.js`, `main.js`, lightbox2
- `results.html`, `fixture.html` - loads `home.css`, `tables.css`, `main.js`
- `teams.html`, `free-games.html`, `whats-futsal.html` - loads `home.css`, `main.js`

## Known Issues (see docs/AUDIT-REPORT.md for full details)
- Broken `<script2026` tag in `index.html:121` (typo)
- XSS risk in `standings.js` (unsanitised JSON to HTML)
- Navigation menus differ across pages
- `submit-form.js` is a duplicate of `submit-solo.js`
- `media.js` is empty, `hamburger.js` is unused
- `svalidation.js` has ~87 lines of commented-out duplicate code
- Phone inputs use `type="number"` instead of `type="tel"`
- Duplicate `id="table-fixture"` in results.html
- Multiple typos in content and code

## Form Endpoints
- **Solo registration** submits to Google Forms via `scripts/submit-solo.js`
- **Team registration** submits to Google Forms via `scripts/submit-team.js`
- **Contact form** submits to Google Forms via hidden iframe + `scripts/cvalidation.js`
- Note: the team form's `<form action>` URL differs from the URL in `submit-team.js`

## Testing
No test suite. To verify changes:
1. Start XAMPP Apache
2. Open `http://localhost/LFL/` in browser
3. Test all pages, forms, and mobile responsive layout
4. Check browser console for JS errors

## Deployment
Static files served via Apache. The `.htaccess` handles HTTPS redirect. No CI/CD pipeline exists.

## Important Paths
- Main stylesheet: `css/home.css`
- All page HTML: root directory `*.html`
- League data: `data/lfl-standings-*.json`, `data/lfl-scorers.json`
- Team logos: `img/TEAMS/2024/`
- Media photos: `img/media/league/`
