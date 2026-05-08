# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lightweight, fast search tool for UHCW (University Hospitals Coventry and Warwickshire) helpdesk. Combines room location search with a knowledge base for helpdesk information (snackboxes, services, etc.). Built with vanilla JavaScript, CSS, and HTML — no frameworks or build tools required.

## Data Sources

### Location Data
`locations.csv` — comprehensive location data for:
- Walsgrave Hospital
- Hospital of Rugby St Cross
- FM Building
- Clinical Sciences Building (CSB)
- EPR 'Portkabins'
- MHU

Sourced from the Concept system (Facilities > Locations).

### Knowledge Base Data
`knowledge-base.json` — helpdesk articles. Each article:
- **id**: Unique identifier
- **title**: Article title
- **category**: Category badge (e.g., "Services")
- **keywords**: Array of searchable terms
- **summary**: Brief one-line summary
- **content**: Full article content
- **contacts**: Array of contact information
- **lastUpdated**: Last update date

## Architecture

### Core Files
- **index.html**: Single-page app — search bar, filter buttons, results area. No chrome, no modal, no taskbar.
- **script.js**: All application logic:
  - CSV and JSON data loading/parsing
  - Live search with 300ms debounce on `input` event; also fires on Enter key
  - Site filter button management (`activeFilters.site`)
  - `displayResults()` renders KB cards first, then location table (desktop) + mobile cards
  - Rain easter egg triggered by typing "make it rain"
- **rainAnimation.js**: Canvas rain animation class
- **knowledge-base.json**: KB articles
- **styles.css**: Dark modern interface
  - CSS custom properties: `--bg`, `--bg-elevated`, `--text-primary`, `--text-muted`, `--border`, `--border-subtle`, etc.
  - Base font: system stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`), 16px
  - Mobile breakpoint: `768px`

### Key Features

1. **Unified Search**: Live search (300ms debounce) across both data sources
   - Locations: searches Site, Building, Department, Description, Room Number, Floor
   - Knowledge Base: searches title, summary, content, category, keywords
   - KB cards appear first, then location results
   - Status text shows "X result(s)" or clears on empty input

2. **Site Filter**: Three hardcoded buttons in HTML — "All Locations", "Walsgrave", "St Cross"
   - Filters location results only; KB always shows all matches
   - Active filter stored in `activeFilters.site`; re-runs search immediately on change

3. **Location Results — Desktop**: Full table (Site, Building, Department, Description, Room, Floor)

4. **Location Results — Mobile**: Cards shown instead of table (`results-mobile-cards` div, `.results-table-wrapper` hidden via CSS)
   - Each card shows: Dept, Building, Description, Room
   - Site and Floor omitted on mobile

5. **Knowledge Base Cards**: Dark panel cards with title, summary, content, contacts list, last updated

6. **Easter Egg**: Rain animation triggered by typing "make it rain" (caught in debounced input handler)

## Data Structure

CSV parsed into:
```javascript
{
  Site: string,        // Column 0
  Building: string,    // Column 1
  Floor: string,       // Column 2
  Description: string, // Column 4
  'Room Num': string,  // Column 5
  Department: string   // Column 9
}
```

Column mapping hardcoded in `loadLocationData()` in script.js.

## Development

### Running
Open `index.html` directly in browser. No build process, server, or dependencies.

### Testing Changes
Refresh browser after edits. Test both desktop and mobile (≤768px) viewports.

### Mobile Testing
At `768px` breakpoint:
- `.results-table-wrapper` hidden; `.results-mobile-cards` shown
- Search controls stack vertically

## Known Issues

Some CSV data is malformed but results remain accurate. Searching "rainsbrook" shows obsolete rooms first; scroll down for current rooms.

## Important Considerations

- **No Package Manager**: No package.json, npm, or build tools — intentional
- **Data Parsing**: CSV uses custom parser (handles quoted values, trims whitespace); JSON via fetch API
- **Search Trigger**: Debounced 300ms on `input` event + Enter key
- **Knowledge Base**: Articles cleared and re-rendered each search to avoid duplication
