const toggleIcon = document.getElementById('theme-toggle');

function switchTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        toggleIcon.textContent = '☀️';  // Set to sun emoji
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        toggleIcon.textContent = '🌙';  // Set to moon emoji
    }
}

toggleIcon.addEventListener('click', switchTheme);

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleIcon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
}

// Global variables for filters and data
let allLocations = [];
let filterOptions = {
    sites: new Set(),
    locations: new Set()
};
let activeFilters = {
    site: '',
    location: ''
};

// Function to load and search location data
async function searchLocations(searchTerm) {
    try {
        // If we haven't loaded the data yet, load it
        if (allLocations.length === 0) {
            await loadLocationData();
        }
        
        // Convert search term to lowercase for case-insensitive search
        searchTerm = searchTerm.toLowerCase();
        
        // Filter results based on search term and active filters
        const results = allLocations.filter(location => {
            // First check if the location matches the active filters
            if (activeFilters.site && location['Site'] !== activeFilters.site) return false;
            if (activeFilters.location && location['Building'] !== activeFilters.location) return false;
            
            // Then check if it matches the search term
            return (
                location['Site']?.toLowerCase().includes(searchTerm) ||
                location['Building']?.toLowerCase().includes(searchTerm) ||
                location['Department']?.toLowerCase().includes(searchTerm) ||
                location['Description']?.toLowerCase().includes(searchTerm) ||
                location['Room Num']?.toLowerCase().includes(searchTerm) ||
                location['Floor']?.toLowerCase().includes(searchTerm)
            );
        });
        
        return results;
    } catch (error) {
        console.error('Error loading or searching location data:', error);
        alert('Error loading location data: ' + error.message);
        return [];
    }
}

// Function to load all location data
async function loadLocationData() {
    try {
        const response = await fetch('locations.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
        
        // Reset filter options
        filterOptions = {
            sites: new Set(),
            locations: new Set()
        };
        
        // Process each line after headers
        allLocations = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            // Split lines by comma
            const values = lines[i].split(',').map(value => {
                // Remove quotes, and trim
                return value.replace(/^["']|["']$/g, '').trim();
            });
            
            // Map CSV columns to expected format
            const mappedLocation = {
                'Site': values[0] || '-',
                'Building': values[1] || '-',
                'Floor': values[2] || '-',
                'Description': values[4] || '-',
                'Room Num': values[5] || '-',
                'Department': (values[9] || '-').replace(/["']/g, '') // Extra cleanup for Department
            };
            
            // Add to all locations array
            allLocations.push(mappedLocation);
            
            // Add to filter options if not empty
            if (mappedLocation['Site'] !== '-') filterOptions.sites.add(mappedLocation['Site']);
            if (mappedLocation['Building'] !== '-') filterOptions.locations.add(mappedLocation['Building']);
        }
        
        // Populate filter dropdowns
        populateFilterDropdowns();
        
        return allLocations;
    } catch (error) {
        console.error('Error loading location data:', error);
        throw error;
    }
}

// Function to populate filter dropdowns
function populateFilterDropdowns() {
    const siteFilter = document.getElementById('siteFilter');
    const buildingFilter = document.getElementById('buildingFilter');
    
    // Clear existing options except the first one
    siteFilter.innerHTML = '<option value="">All Sites</option>';
    buildingFilter.innerHTML = '<option value="">All Locations</option>';
    
    // Add sorted options to each dropdown
    [...filterOptions.sites].sort().forEach(site => {
        const option = document.createElement('option');
        option.value = site;
        option.textContent = site;
        siteFilter.appendChild(option);
    });
    
    [...filterOptions.locations].sort().forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        buildingFilter.appendChild(option);
    });
}

// Function to apply filters and update search results
async function applyFilters() {
    const searchInput = document.getElementById('locationSearch');
    const searchTerm = searchInput.value.trim();
    
    // Update reset button state
    updateResetFiltersButtonState();
    
    // Update search results with current filters
    const results = await searchLocations(searchTerm);
    displayResults(results);
}

// Function to reset all filters
function resetFilters() {
    document.getElementById('siteFilter').value = '';
    document.getElementById('buildingFilter').value = '';
    
    activeFilters = {
        site: '',
        location: ''
    };
    
    // Update reset button state
    updateResetFiltersButtonState();
    
    // Apply the reset filters
    applyFilters();
}

// Function to update the reset filters button state
function updateResetFiltersButtonState() {
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Check if any filters are active
    if (activeFilters.site || activeFilters.location) {
        resetFiltersBtn.classList.add('active');
    } else {
        resetFiltersBtn.classList.remove('active');
    }
}

// Function to display search results
function displayResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    const resultsBody = document.getElementById('resultsBody');
    const noResults = document.getElementById('noResults');
    
    // Clear previous results
    resultsBody.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.style.display = 'block';
        noResults.style.display = 'block';
        return;
    }
    
    // Hide the no results message and show table
    noResults.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    // Add results to table
    results.forEach(location => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Site">${location['Site'] || '-'}</td>
            <td data-label="Location">${location['Building'] || '-'}</td>
            <td data-label="Department">${location['Department'] || '-'}</td>
            <td data-label="Description">${location['Description'] || '-'}</td>
            <td data-label="Room">${location['Room Num'] || '-'}</td>
            <td data-label="Floor">${location['Floor'] || '-'}</td>
        `;
        resultsBody.appendChild(row);
    });
}

// Set up search input and filter event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load the fly game script
    if (!window.flyGame) {
        const flyGameScript = document.createElement('script');
        flyGameScript.src = 'flyGame.js';
        document.head.appendChild(flyGameScript);
    }
    const searchInput = document.getElementById('locationSearch');
    const clearButton = document.getElementById('clearSearch');
    const siteFilter = document.getElementById('siteFilter');
    const buildingFilter = document.getElementById('buildingFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    let debounceTimer;

    // Function to toggle clear button visibility
    const toggleClearButton = () => {
        clearButton.style.display = searchInput.value.length > 0 ? 'flex' : 'none';
    };

    // Clear button click handler
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        toggleClearButton();
        document.getElementById('searchResults').style.display = 'none';
        searchInput.focus(); // Keep focus on input after clearing
    });

    // Search input event handler
    searchInput.addEventListener('input', (e) => {
        toggleClearButton();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length === 0) {
                document.getElementById('searchResults').style.display = 'none';
                return;
            }
            
            // Check for fly game trigger and end conditions
            if (searchTerm.toLowerCase() === 'flies') {
                // Start the fly game
                window.flyGame.start();
            } else if (searchTerm.toLowerCase() === 'no flies') {
                // End the fly game
                window.flyGame.stop();
            } else if (searchTerm.toLowerCase() === 'make it rain') {
                // Start the rain animation
                window.rainAnimation.start();
            }
            
            const results = await searchLocations(searchTerm);
            displayResults(results);
        }, 300); // Debounce for 300ms to prevent too many searches
    });
    
    // Filter change event handlers
    siteFilter.addEventListener('change', () => {
        activeFilters.site = siteFilter.value;
        applyFilters();
    });
    
    buildingFilter.addEventListener('change', () => {
        activeFilters.location = buildingFilter.value;
        applyFilters();
    });
    
    // Reset filters button event handler
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Initialize reset button state
    updateResetFiltersButtonState();
    
    // Load data on initial page load
    loadLocationData();
});
