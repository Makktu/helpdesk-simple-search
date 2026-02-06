# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lightweight, fast search tool for UHCW (University Hospitals Coventry and Warwickshire) helpdesk. Combines room location search with a knowledge base for helpdesk information (snackboxes, services, etc.). Built with vanilla JavaScript, CSS, and HTML - no frameworks or build tools required.

## Data Sources

### Location Data
The application uses a CSV file (`locations.csv`) containing comprehensive location data for:
- Walsgrave Hospital
- Hospital of Rugby St Cross
- FM Building
- Clinical Sciences Building (CSB)
- EPR 'Portkabins'
- MHU

The data was sourced from the Concept system (Facilities > Locations).

### Knowledge Base Data
The application uses a JSON file (`knowledge-base.json`) containing helpdesk knowledge base articles. Each article includes:
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
- **index.html**: Main page structure with hero section, search interface, site filter radio buttons, and results area
- **script.js**: Main application logic including:
  - CSV location data loading and parsing
  - JSON knowledge base loading and parsing
  - Unified search functionality across both data sources
  - Site filter radio button management
  - Dark/light theme switching
  - Easter egg trigger for rain animation
- **rainAnimation.js**: Rain animation class triggered by searching "make it rain"
- **knowledge-base.json**: Knowledge base articles in JSON format
- **styles.css**: "Immersive Glass UI" design including:
  - Full-viewport hero (`min-height: 100vh`) with centered glass-morphism panel
  - Hospital image (uhcw_image.png) as animated hero background
  - Glass panel (`backdrop-filter: blur(20px)`) holding search bar and filters
  - Staggered entrance animations (title, subtitle, search, filters with increasing delays)
  - Enhanced search input with `border-radius: 16px`, focus glow ring, subtle scale
  - Glass radio filter pills with semi-transparent backgrounds
  - Scroll indicator chevron at bottom of hero with bounce animation
  - Deep navy/blue palette (Tailwind-inspired) with rich dark mode (`#0f172a` base)
  - Accent gradient (`#2563eb` to `#7c3aed`) on badges and table headers
  - KB cards with white bg in light mode, gradient badges, 16px radius
  - Results entrance animation (fade + slide up) triggered via JS class toggle
  - `@supports` fallback for browsers without `backdrop-filter`
  - Dark mode support via CSS custom properties with deep navy palette
  - Responsive mobile styles with animations disabled
  - Table-to-card layout transformation on mobile

### Key Features
1. **Immersive Glass UI Hero**: Full-viewport hero with hospital image backdrop and frosted glass panel
   - Glass-morphism panel (`backdrop-filter: blur(20px)`) centered on screen with `border-radius: 24px`
   - Staggered entrance animations: panel (0s), title (0.15s), subtitle (0.25s), search (0.35s), filters (0.45s)
   - Scroll indicator chevron with bounce animation at bottom of hero
   - Very slow, subtle 70-second background pan animation
   - All entrance animations disabled on mobile and for `prefers-reduced-motion`
2. **Unified Search**: Real-time search across both location data and knowledge base with debouncing
   - Locations: Searches Site, Building, Department, Description, Room Number, and Floor fields
   - Knowledge Base: Searches title, summary, content, category, and keywords
   - Results show knowledge base cards first, followed by location table
   - Results section has entrance fade animation on each new search
3. **Site Filter**: Glass radio filter pills within the hero panel
   - Filters location results only (knowledge base shows all matches)
   - Semi-transparent white backgrounds matching glass aesthetic
4. **Knowledge Base Cards**: Custom card layout for knowledge base articles
   - Gradient accent badge, title, summary, content, contacts, and last updated date
   - White bg in light mode, dark navy in dark mode, 16px border-radius
5. **Theme Toggle**: Fixed position rounded-square toggle with glass-morphism, rotation on hover, persisted in localStorage
6. **Mobile Responsive**: `100svh` hero, all animations disabled, glass panel full-width, table becomes cards
7. **Easter Eggs**: Rain animation triggered by "make it rain" search term

## Data Structure

The CSV is parsed into objects with the following schema:
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

Note: Some columns from the CSV are skipped during parsing. The mapping is hardcoded in script.js:100-117.

## Development

### Running the Application
Open `index.html` directly in a browser. No build process, server, or dependencies required.

### Testing Changes
Since this is a static site, refresh the browser after making changes. Test both desktop and mobile viewports.

### Mobile Testing
The application has specific mobile breakpoints:
- `@media (max-width: 768px)`: Scales radio buttons, transforms location table to cards, scales hero section, adjusts knowledge base card sizing
- `@media (max-width: 480px)`: Further adjusts hero title, subtitle, search bar, and theme toggle sizing

### Design Philosophy — "Immersive Glass UI"
- Full-viewport hero creates dramatic, app-like first impression
- Frosted glass panel (`backdrop-filter: blur(20px)`) centers all interactive controls
- Deep navy/blue Tailwind-inspired palette replaces flat Google-gray look
  - Light mode: `#f8fafc` results bg, `#ffffff` cards, `#1e3a8a` hero
  - Dark mode: `#0b1120` results bg, `#1e293b` cards, `#0c1a3d` hero
- Accent gradient (`#2563eb` → `#7c3aed`) on badges and table headers
- Hospital image prominently displayed as animated hero background
  - Desktop: `background-size: 100% auto` to show full width of image
  - Mobile: `background-size: auto 100%` to show full height on smaller screens
  - Lower opacity gradient (0.6-0.65 alpha) ensures image is clearly visible
  - GPU-accelerated CSS transforms for optimal performance
- Staggered entrance animations create inspiring first impression
- `@supports` fallback for `backdrop-filter` uses solid semi-transparent bg
- Large, accessible search bar with focus glow ring is the primary interaction point
- Results section has entrance fade animation and distinct visual separation
- Rounded-square theme toggle with glass-morphism and rotation hover effect

### Background Animation Technical Details
The hero background uses a performant animation technique:
- **Implementation**: CSS `::before` pseudo-element with `transform: translateY()` animation
- **Performance**: GPU-accelerated transforms (not background-position) prevent repaints
- **Layering**: Three layers - animated image (z-index: 0), gradient overlay (z-index: 1), content (z-index: 2)
- **Duration**: 70 seconds per cycle with ease-in-out timing for very slow, subtle movement
- **Accessibility**: Animation disabled for users with `prefers-reduced-motion: reduce`
- **Mobile**: Animation disabled on screens ≤768px to preserve battery and performance
- **Method**: Pseudo-element height set to 320%, translates -69% at midpoint to reveal the entire (or almost entire) hospital image

## Known Issues

Some CSV data is malformed but results remain accurate. For example, searching "rainsbrook" shows obsolete rooms first; scroll down for current rooms.

## Important Considerations

- **No Package Manager**: This project intentionally has no package.json, npm, or build tools
- **Theme Persistence**: Theme preference stored in localStorage with key 'theme'
- **Data Parsing**:
  - CSV: Custom CSV parser in script.js handles quoted values and trims whitespace
  - JSON: Knowledge base loaded via fetch API
- **Filter State**: Active site filter stored in `activeFilters.site` and applied to location searches only
- **Debouncing**: Search input debounced to 300ms to reduce unnecessary searches
- **Knowledge Base**: Articles appear once per search result; cleared properly between searches to avoid duplication
