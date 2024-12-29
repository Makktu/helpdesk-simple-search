# Helpdesk Simple Search

A lightweight, fast search tool for quickly finding room locations across UHCW sites. Built with vanilla JavaScript and CSS, no frameworks required.

## The Holy Grail appears 

What started as a simple JSON-based room finder has evolved into something a touch more comprehensive thanks to the discovery of "The Holy Grail of Helpdesk" - a complete CSV dataset of all UHCW locations. All this time, all sites were hidden in plain sight within Concept (Facilities>Locations).

This miraculous find means we now have comprehensive location data for:
- Walsgrave Hospital
- Hospital of Rugby St Cross
- the FM Building
- the Clinical Sciences Building
- those EPR 'Portkabins' (not my spelling, guv)
- and the MHU - (better to have this and not need it, than - you know the rest)

## Features

- Lightning-fast search across all UHCW sites
- Search by room number, department name, or partial terms
- Clean, Google-inspired interface
- Dark mode support
- Mobile-responsive design

## Usage

Simply start typing in order to search. The tool will instantly filter results as you type, searching across:
- Site
- Building
- Department
- Description
- Room Number
- Floor

## Issues

Some of the data is a little malformed, but the results are still accurate and available.

E.g. if you search 'rainsbrook', the first results displayed are for rooms that are no longer used, and you will have to scroll down to see the newer rooms that you're probably looking for. There are a few isolated cases of things like that.