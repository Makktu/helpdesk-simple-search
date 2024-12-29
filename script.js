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

// Function to load and search location data
async function searchLocations(searchTerm) {
    try {
        const response = await fetch('locations.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        // Convert search term to lowercase for case-insensitive search
        searchTerm = searchTerm.toLowerCase();
        
        // Parse CSV
        const results = [];
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
        
        // Process each line after headers
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            // Split lines by comma
            const values = lines[i].split(',').map(value => {
                // Remove quotes, and trim
                return value.replace(/^["']|["']$/g, '').trim();
            });
            
            // Map CSV columns to expected format using explicit indexes - yes, this is a kludgy way of doing it, but I am a hack and it works...
            const mappedLocation = {
                'Site': values[0] || '-',
                'Building': values[1] || '-',
                'Floor': values[2] || '-',
                'Description': values[4] || '-',
                'Room Num': values[5] || '-',
                'Department': (values[9] || '-').replace(/["']/g, '') // Extra cleanup for Department
            };

            console.log('Mapped location:', mappedLocation);

            // Search relevant fields only
            if (
                mappedLocation['Site']?.toLowerCase().includes(searchTerm) ||
                mappedLocation['Building']?.toLowerCase().includes(searchTerm) ||
                mappedLocation['Department']?.toLowerCase().includes(searchTerm) ||
                mappedLocation['Description']?.toLowerCase().includes(searchTerm) ||
                mappedLocation['Room Num']?.toLowerCase().includes(searchTerm) ||
                mappedLocation['Floor']?.toLowerCase().includes(searchTerm)
            ) {
                results.push(mappedLocation);
            }
        }
        return results;
    } catch (error) {
        console.error('Error loading or searching location data:', error);
        alert('Error loading location data: ' + error.message);
        return [];
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
            <td data-label="Building">${location['Building'] || '-'}</td>
            <td data-label="Department">${location['Department'] || '-'}</td>
            <td data-label="Description">${location['Description'] || '-'}</td>
            <td data-label="Room">${location['Room Num'] || '-'}</td>
            <td data-label="Floor">${location['Floor'] || '-'}</td>
        `;
        resultsBody.appendChild(row);
    });
}

// Set up search input event listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('locationSearch');
    const clearButton = document.getElementById('clearSearch');
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

    searchInput.addEventListener('input', (e) => {
        toggleClearButton();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length === 0) {
                document.getElementById('searchResults').style.display = 'none';
                return;
            }
            const results = await searchLocations(searchTerm);
            displayResults(results);
        }, 300); // Debounce for 300ms to prevent too many searches
    });
});
