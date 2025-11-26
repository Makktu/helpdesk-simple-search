const toggleIcon = document.getElementById('theme-toggle');

function switchTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    toggleIcon.textContent = '☀️'; // Set to sun emoji
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    toggleIcon.textContent = '🌙'; // Set to moon emoji
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
let knowledgeBaseArticles = [];
let filterOptions = {
  sites: new Set(),
};
let activeFilters = {
  site: '',
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
    const results = allLocations.filter((location) => {
      // First check if the location matches the active site filter
      if (activeFilters.site && location['Site'] !== activeFilters.site)
        return false;

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
    const headers = lines[0]
      .split(',')
      .map((header) => header.replace(/"/g, '').trim());

    // Reset filter options
    filterOptions = {
      sites: new Set(),
    };

    // Process each line after headers
    allLocations = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines

      // Split lines by comma
      const values = lines[i].split(',').map((value) => {
        // Remove quotes, and trim
        return value.replace(/^["']|["']$/g, '').trim();
      });

      // Map CSV columns to expected format
      const mappedLocation = {
        Site: values[0] || '-',
        Building: values[1] || '-',
        Floor: values[2] || '-',
        Description: values[4] || '-',
        'Room Num': values[5] || '-',
        Department: (values[9] || '-').replace(/["']/g, ''), // Extra cleanup for Department
      };

      // Add to all locations array
      allLocations.push(mappedLocation);

      // Add to filter options if not empty
      if (mappedLocation['Site'] !== '-')
        filterOptions.sites.add(mappedLocation['Site']);
    }

    // Populate site filter radio buttons
    populateSiteFilterRadios();

    return allLocations;
  } catch (error) {
    console.error('Error loading location data:', error);
    throw error;
  }
}

// Function to load knowledge base data
async function loadKnowledgeBase() {
  try {
    const response = await fetch('knowledge-base.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    knowledgeBaseArticles = data.articles || [];
    return knowledgeBaseArticles;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    // Don't throw - knowledge base is optional
    return [];
  }
}

// Function to search knowledge base
async function searchKnowledgeBase(searchTerm) {
  try {
    // If we haven't loaded the data yet, load it
    if (knowledgeBaseArticles.length === 0) {
      await loadKnowledgeBase();
    }

    // Convert search term to lowercase for case-insensitive search
    searchTerm = searchTerm.toLowerCase();

    // Filter articles based on search term matching keywords, title, summary, or content
    const results = knowledgeBaseArticles.filter((article) => {
      return (
        article.title?.toLowerCase().includes(searchTerm) ||
        article.summary?.toLowerCase().includes(searchTerm) ||
        article.content?.toLowerCase().includes(searchTerm) ||
        article.category?.toLowerCase().includes(searchTerm) ||
        article.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(searchTerm)
        )
      );
    });

    return results;
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return [];
  }
}

// Function to populate site filter radio buttons
function populateSiteFilterRadios() {
  const radioContainer = document.getElementById('siteFilterRadios');

  // Keep the "All Sites" option, add other sites after it
  const sortedSites = [...filterOptions.sites].sort();

  sortedSites.forEach((site) => {
    const label = document.createElement('label');
    label.className = 'radio-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'siteFilter';
    input.value = site;

    const span = document.createElement('span');
    span.textContent = site;

    label.appendChild(input);
    label.appendChild(span);
    radioContainer.appendChild(label);
  });
}

// Function to apply filters and update search results
async function applyFilters() {
  const searchInput = document.getElementById('locationSearch');
  const searchTerm = searchInput.value.trim();

  // Search both locations and knowledge base
  const locationResults = await searchLocations(searchTerm);
  const knowledgeResults = await searchKnowledgeBase(searchTerm);
  displayResults(locationResults, knowledgeResults);
}

// Function to display search results (both locations and knowledge base)
function displayResults(locationResults, knowledgeResults = []) {
  const resultsContainer = document.getElementById('searchResults');
  const resultsBody = document.getElementById('resultsBody');
  const noResults = document.getElementById('noResults');

  // Clear previous results
  resultsBody.innerHTML = '';

  // Clear any existing knowledge base cards
  const existingKbCards = resultsContainer.querySelectorAll('.knowledge-base-card');
  existingKbCards.forEach(card => card.remove());

  const hasLocationResults = locationResults.length > 0;
  const hasKnowledgeResults = knowledgeResults.length > 0;

  if (!hasLocationResults && !hasKnowledgeResults) {
    resultsContainer.style.display = 'block';
    noResults.style.display = 'block';
    return;
  }

  // Hide the no results message and show results
  noResults.style.display = 'none';
  resultsContainer.style.display = 'block';

  // Display knowledge base results first if any
  if (hasKnowledgeResults) {
    knowledgeResults.forEach((article) => {
      const kbCard = document.createElement('div');
      kbCard.className = 'knowledge-base-card';

      // Format contacts as HTML list if they exist
      let contactsHtml = '';
      if (article.contacts && article.contacts.length > 0) {
        contactsHtml = '<div class="kb-contacts"><strong>Contacts:</strong><ul>';
        article.contacts.forEach(contact => {
          contactsHtml += `<li>${contact}</li>`;
        });
        contactsHtml += '</ul></div>';
      }

      kbCard.innerHTML = `
        <div class="kb-header">
          <span class="kb-badge">${article.category || 'Knowledge Base'}</span>
          <h3 class="kb-title">${article.title}</h3>
        </div>
        <p class="kb-summary">${article.summary}</p>
        <p class="kb-content">${article.content}</p>
        ${contactsHtml}
        ${article.lastUpdated ? `<p class="kb-updated">Last updated: ${article.lastUpdated}</p>` : ''}
      `;

      // Insert before the table
      resultsContainer.insertBefore(kbCard, resultsContainer.firstChild);
    });
  }

  // Display location results in table if any
  if (hasLocationResults) {
    locationResults.forEach((location) => {
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
}

// Set up search input and filter event listeners
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

      // Check for rain animation trigger
      if (searchTerm.toLowerCase() === 'make it rain') {
        // Start the rain animation
        window.rainAnimation.start();
      }

      // Search both locations and knowledge base
      const locationResults = await searchLocations(searchTerm);
      const knowledgeResults = await searchKnowledgeBase(searchTerm);
      displayResults(locationResults, knowledgeResults);
    }, 300); // Debounce for 300ms to prevent too many searches
  });

  // Site filter radio button change handler (delegated event listener)
  document.addEventListener('change', (e) => {
    if (e.target.name === 'siteFilter') {
      activeFilters.site = e.target.value;
      applyFilters();
    }
  });

  // Load data on initial page load
  loadLocationData();
  loadKnowledgeBase();
});
