# London Futsal League (LFL) Website

The official website for the **London Futsal League**, a community futsal organisation operating across multiple venues in London since 2015.

**Live site:** [londonfutsalleague.com](https://www.londonfutsalleague.com)

## About

LFL organises competitive futsal leagues and casual games in London, currently running at:
- **Clapham Common** - Harris Academy Clapham (SW4 8LD)
- **North Finchley** - Wren Academy (N12 9HB)

The website provides team and player registration, league standings, match results, media galleries, and general information about futsal.

## Tech Stack

- **HTML5** - Static multi-page site (10 pages)
- **CSS3** - Custom stylesheets with CSS Grid, Flexbox, and CSS custom properties
- **JavaScript** - Vanilla JS + jQuery 3.5.1 for dynamic content
- **Google Forms** - Backend for form submissions (team registration, solo registration, contact)
- **Lightbox2** - Photo gallery lightbox
- **Curator.io** - Social media feed aggregation
- **Wistia** - Video hosting/embedding
- **Font Awesome** - Icons
- **Google Fonts** - Ubuntu typeface
- **Apache (.htaccess)** - HTTPS redirect

## Project Structure

```
LFL/
├── index.html              # Home page
├── about.html              # About us + contact form
├── teams.html              # Current season team gallery
├── team.html               # Team registration form
├── solo.html               # Solo player registration form
├── media.html              # Season photos + league cards
├── free-games.html         # Free games hosting guide
├── whats-futsal.html       # What is Futsal? info page
├── table.html              # League standings (JSON-driven)
├── results.html            # Match results archive
├── fixture.html            # News (placeholder)
├── .htaccess               # Apache HTTPS redirect
├── css/
│   ├── home.css            # Main stylesheet
│   ├── tables.css          # Table styles
│   ├── forms.css           # Form styles
│   └── media.css           # Gallery styles
├── scripts/
│   ├── main.js             # Footer copyright year
│   ├── standings.js        # League table data fetching (jQuery)
│   ├── submit-team.js      # Team form submission handler
│   ├── submit-solo.js      # Solo form submission handler
│   ├── submit-form.js      # Contact form submission handler
│   ├── cvalidation.js      # Contact form validation
│   ├── svalidation.js      # Solo form validation
│   ├── tvalidation.js      # Team form validation
│   ├── media.js            # Media page scripts
│   └── hamburger.js        # Legacy mobile menu toggle
├── data/
│   ├── lfl-standings-a.json    # South division standings
│   ├── lfl-standings-b.json    # North division standings
│   └── lfl-scorers.json        # Top scorers
├── img/                    # Images and team logos
├── video/                  # Video embed page
├── docs/                   # Documentation
│   └── AUDIT-REPORT.md     # Full codebase audit
└── v0/ - v1/              # Archived previous versions
```

## Local Development

This site runs on a standard web server. For local development with XAMPP:

1. Clone the repository into your XAMPP `htdocs` directory:
   ```bash
   cd /path/to/xampp/htdocs
   git clone <repo-url> LFL
   ```

2. Start Apache in XAMPP

3. Open `http://localhost/LFL/` in your browser

No build step is required - the site is plain HTML/CSS/JS.

## Pages

| Page | URL | Description |
|---|---|---|
| Home | `index.html` | Hero video, CTAs for registration |
| Free Games | `free-games.html` | Guide on hosting free futsal games |
| What is Futsal? | `whats-futsal.html` | Educational content about futsal |
| Teams | `teams.html` | Gallery of current season teams |
| Season Info | `media.html` | Photos and upcoming league details |
| About | `about.html` | About LFL, mission/vision, contact form |
| Solo Registration | `solo.html` | Individual player sign-up |
| Team Registration | `team.html` | Team sign-up |
| Standings | `table.html` | League table (data from JSON) |
| Results | `results.html` | Match results by matchweek |

## Data Files

League standings and top scorers are stored as JSON in `data/`:
- `lfl-standings-a.json` - South division table
- `lfl-standings-b.json` - North division table
- `lfl-scorers.json` - Top scorers list

These are fetched client-side by `scripts/standings.js` and rendered into the standings page.

## Modernisation

A comprehensive audit has been completed. See [docs/AUDIT-REPORT.md](docs/AUDIT-REPORT.md) for detailed findings covering UX/UI, performance, security, SEO, accessibility, and code quality, along with a prioritised roadmap for modernisation.

## Affiliated

London Futsal League is affiliated to the [Amateur Football Alliance](https://www.amateur-fa.com).

## Contact

- **Email:** contact@londonfutsalleague.com
- **Instagram:** [@londonfutsalleague](https://www.instagram.com/londonfutsalleague/)
- **Facebook:** [LondonFutsalLeague](https://www.facebook.com/LondonFutsalLeague/)
- **Twitter:** [@LondonFutsalLe](https://twitter.com/LondonFutsalLe)
