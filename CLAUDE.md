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
- **styles.css**: All styling including:
  - Modern hero section with dark blue gradient background
  - Hospital image (uhcw_image.png) as hero background
  - Large, prominent search bar with search icon
  - Radio button site filters beneath search bar
  - Knowledge base card styling with category badges
  - Separate results section with light background
  - Dark mode support via CSS custom properties
  - Responsive mobile styles
  - Table-to-card layout transformation on mobile

### Key Features
1. **Hero Section**: Modern design with dark blue gradient, animated hospital image background, and prominent search bar
   - Very slow, subtle 70-second animation that pans vertically through the entire image
   - Animation disabled on mobile devices for performance
   - Respects `prefers-reduced-motion` accessibility setting
2. **Unified Search**: Real-time search across both location data and knowledge base with debouncing
   - Locations: Searches Site, Building, Department, Description, Room Number, and Floor fields
   - Knowledge Base: Searches title, summary, content, category, and keywords
   - Results show knowledge base cards first, followed by location table
3. **Site Filter**: Radio button filter for sites beneath the search bar
   - Filters location results only (knowledge base shows all matches)
   - Clean, modern pill-style design with hover effects
4. **Knowledge Base Cards**: Custom card layout for knowledge base articles
   - Category badge, title, summary, content, contacts, and last updated date
   - Distinct visual design to differentiate from location results
5. **Theme Toggle**: Fixed position dark/light mode toggle with glass-morphism effect, persisted in localStorage
6. **Mobile Responsive**: Radio filters scale down on mobile; results display as cards instead of tables; hero scales appropriately
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

### Design Philosophy
- Moved away from Google-style mimicry to establish unique identity
- Hero section uses dark blue (#1e4fb5) with reduced-opacity gradient overlay (0.65-0.70 alpha)
- Hospital image (uhcw_image.png) prominently displayed as animated hero background
  - Desktop: `background-size: 100% auto` to show full width of image
  - Mobile: `background-size: auto 100%` to show full height on smaller screens
  - Lower opacity gradient ensures image is clearly visible while maintaining text readability
  - Animated using GPU-accelerated CSS transforms for optimal performance
- Large, accessible search bar is the primary interaction point
- Results section has distinct visual separation with lighter background
- Clean, modern card-based design for filters and results
- Fixed position theme toggle with subtle glass-morphism effect

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
