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
- **index.html**: Windows 95 desktop environment with: teal wallpaper, desktop icons, floating Win95 window (title bar, menu bar, content area, status bar), taskbar, Start menu, and About dialog
- **script.js**: Main application logic including:
  - CSV location data loading and parsing
  - JSON knowledge base loading and parsing
  - Unified search across both data sources (triggered by button click or Enter key)
  - Site filter radio button management
  - Win95 window controls (minimize, maximize, close, taskbar restore)
  - Start menu and Programs submenu interaction
  - Desktop icon double-click handlers
  - Live clock in system tray
  - About dialog (opened via Help menu)
  - Easter egg trigger for rain animation
- **rainAnimation.js**: Rain animation class triggered by searching "make it rain"
- **knowledge-base.json**: Knowledge base articles in JSON format
- **styles.css**: Windows 95 style design including:
  - CSS custom properties for the full Win95 color palette (`--win95-teal`, `--win95-gray`, `--win95-blue`, etc.)
  - Desktop wallpaper (`#008080` teal) with hospital image at 0.15 opacity as subtle background
  - Desktop icons (My Computer, Network Neighborhood, Recycle Bin, Helpdesk95.exe) using emoji inside CSS-drawn icon frames
  - Win95 window chrome: raised/sunken borders using 4-value `border-color` shorthand (`highlight / dark-shadow / dark-shadow / highlight` = raised; reversed = sunken)
  - Title bar with `linear-gradient(90deg, #000080, #1084d0)` and 16×14px window control buttons
  - Menu bar, panels with gradient headers, Win95 form controls (inputs, buttons, fieldsets, radio buttons)
  - Custom Win95 scrollbar via `::-webkit-scrollbar` pseudo-elements
  - Results table with raised/sunken cell borders; row hover highlights with navy selection color
  - KB result cards in Win95 panel style with gray contacts box
  - Status bar with three sunken sections and a dotted resize handle
  - Taskbar at fixed bottom: Start button, divider, window button, system tray (HC toggle + clock)
  - Start menu with navy sidebar ("WINDOWS 95"), menu items with arrow indicators, Programs submenu
  - About dialog as floating Win95 modal with overlay
  - `MS Sans Serif` / `Microsoft Sans Serif` font stack at 11px base size
  - Mobile breakpoint at 768px: hides desktop icons, stacks search controls vertically, shrinks window

### Key Features
1. **Windows 95 Desktop Environment**: Full desktop simulation with wallpaper, icons, taskbar, and Start menu
   - Hospital image used as faint (0.15 opacity) desktop wallpaper background
   - Desktop icons: double-click "Helpdesk95.exe" to restore window; "My Computer" opens About dialog; others show alert messages
   - Start button with Windows logo icon; Programs submenu appears on hover
   - Live clock in system tray updating every second (only tray item)
2. **Win95 Application Window**: Authentic chrome with gradient title bar, menu bar, status bar
   - Minimize hides the window (restore via taskbar item); Maximize toggles `.maximized` class for full-screen
   - Close hides the window (same as minimize — no data is destroyed)
   - Help menu item opens the About dialog
3. **Unified Search**: Search triggered by "Find Now" button or Enter key (no debouncing)
   - Locations: Searches Site, Building, Department, Description, Room Number, and Floor fields
   - Knowledge Base: Searches title, summary, content, category, and keywords
   - Results show knowledge base cards first, followed by location table
   - Status bar shows "X object(s)" count and "Search complete" / "No results found"
4. **Site Filter**: Win95-style radio buttons inside a `<fieldset>` with raised border
   - Filters location results only (knowledge base always shows all matches)
   - Populated dynamically from unique site values in the CSV
5. **Knowledge Base Cards**: Win95 panel-style cards with gray header bar and document icon
   - Summary, content, contacts box (gray inset panel with phone emoji bullets), last updated
6. **Mobile Responsive**: Window repositioned to top-5% on narrow screens; desktop icons hidden; search controls stack vertically
8. **Easter Egg**: Rain animation triggered by searching "make it rain"

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

Note: Some columns from the CSV are skipped during parsing. The mapping is hardcoded in the `loadLocationData` function in script.js.

## Development

### Running the Application
Open `index.html` directly in a browser. No build process, server, or dependencies required.

### Testing Changes
Since this is a static site, refresh the browser after making changes. Test both desktop and mobile viewports.

### Mobile Testing
The application has one primary mobile breakpoint:
- `@media (max-width: 768px)`: Hides desktop icons, stacks radio buttons and search controls vertically, repositions window to top of screen, reduces table font size and padding, hides taskbar window label text

### Design Philosophy — "Windows 95"
- Authentic Win95 aesthetic: flat silver-gray (`#c0c0c0`) surfaces, raised/sunken 2px borders using 4-color `border-color` shorthand
- Raised = `white black black white` (top-left bright, bottom-right dark); sunken = reversed
- Navy title bar gradient (`#000080` → `#1084d0`) matches classic Win95 active window title
- `MS Sans Serif` at 11px is the period-accurate font; fallback chain: `Microsoft Sans Serif`, `Segoe UI`, Tahoma
- Teal desktop (`#008080`) is the iconic Win95 default wallpaper color
- Hospital image is present but kept very faint (0.15 opacity) so it doesn't compete with the Win95 UI chrome
- No CSS animations anywhere (except rain easter egg canvas); Win95 had no animated UI transitions
- Results count phrased as "X object(s)" matching Win95 Explorer status bar language

## Known Issues

Some CSV data is malformed but results remain accurate. For example, searching "rainsbrook" shows obsolete rooms first; scroll down for current rooms.

## Important Considerations

- **No Package Manager**: This project intentionally has no package.json, npm, or build tools
- **Data Parsing**:
  - CSV: Custom CSV parser in script.js handles quoted values and trims whitespace
  - JSON: Knowledge base loaded via fetch API
- **Filter State**: Active site filter stored in `activeFilters.site` and applied to location searches only
- **Search Trigger**: No debouncing — search fires on button click or Enter key only
- **Knowledge Base**: Articles appear once per search result; cleared properly between searches to avoid duplication
- **Window State**: Minimize/close both just hide the DOM element; no state is lost, and the taskbar item restores it
