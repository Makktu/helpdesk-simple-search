// ============================================
// Windows 95 Style Helpdesk - Main Script
// ============================================

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
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
let isStartMenuOpen = false;
let isMaximized = false;

// ============================================
// Theme Toggle (High Contrast)
// ============================================
const themeToggle = document.getElementById('themeToggle');

function switchTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    themeToggle.style.background = 'var(--win95-btn-face)';
    themeToggle.style.color = 'var(--win95-black)';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    themeToggle.style.background = 'var(--win95-selected-bg)';
    themeToggle.style.color = 'var(--win95-selected-text)';
  }
}

themeToggle.addEventListener('click', switchTheme);

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.style.background = 'var(--win95-selected-bg)';
  themeToggle.style.color = 'var(--win95-selected-text)';
}

// ============================================
// Clock
// ============================================
function updateClock() {
  const clock = document.getElementById('clock');
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  clock.textContent = `${displayHours}:${minutes} ${ampm}`;
}

setInterval(updateClock, 1000);
updateClock();

// ============================================
// Start Menu
// ============================================
const startBtn = document.getElementById('startBtn');
const startMenu = document.getElementById('startMenu');
const programsMenu = document.getElementById('programsMenu');
const programsSubmenu = document.getElementById('programsSubmenu');

function toggleStartMenu() {
  isStartMenuOpen = !isStartMenuOpen;
  startMenu.style.display = isStartMenuOpen ? 'flex' : 'none';
  programsSubmenu.style.display = 'none';
  
  if (isStartMenuOpen) {
    startBtn.style.borderColor = 'var(--win95-btn-dark-shadow) var(--win95-btn-highlight) var(--win95-btn-highlight) var(--win95-btn-dark-shadow)';
  } else {
    startBtn.style.borderColor = 'var(--win95-btn-highlight) var(--win95-btn-dark-shadow) var(--win95-btn-dark-shadow) var(--win95-btn-highlight)';
  }
}

startBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleStartMenu();
});

programsMenu.addEventListener('mouseenter', () => {
  programsSubmenu.style.display = 'block';
});

programsMenu.addEventListener('mouseleave', () => {
  setTimeout(() => {
    if (!programsSubmenu.matches(':hover')) {
      programsSubmenu.style.display = 'none';
    }
  }, 100);
});

programsSubmenu.addEventListener('mouseleave', () => {
  programsSubmenu.style.display = 'none';
});

// Close start menu when clicking elsewhere
document.addEventListener('click', (e) => {
  if (isStartMenuOpen && !startMenu.contains(e.target) && e.target !== startBtn) {
    toggleStartMenu();
  }
});

// ============================================
// Window Controls
// ============================================
const helpdeskWindow = document.getElementById('helpdeskWindow');
const minimizeBtn = document.querySelector('.title-btn.minimize');
const maximizeBtn = document.querySelector('.title-btn.maximize');
const closeBtn = document.querySelector('.title-btn.close');
const taskbarItem = document.getElementById('taskbarItem');
let isMinimized = false;

minimizeBtn.addEventListener('click', () => {
  isMinimized = true;
  helpdeskWindow.style.display = 'none';
  taskbarItem.classList.remove('active');
});

maximizeBtn.addEventListener('click', () => {
  isMaximized = !isMaximized;
  if (isMaximized) {
    helpdeskWindow.classList.add('maximized');
  } else {
    helpdeskWindow.classList.remove('maximized');
  }
});

closeBtn.addEventListener('click', () => {
  helpdeskWindow.style.display = 'none';
  taskbarItem.classList.remove('active');
  isMinimized = true;
});

taskbarItem.addEventListener('click', () => {
  if (isMinimized || helpdeskWindow.style.display === 'none') {
    helpdeskWindow.style.display = 'flex';
    taskbarItem.classList.add('active');
    isMinimized = false;
  } else {
    helpdeskWindow.style.display = 'none';
    taskbarItem.classList.remove('active');
    isMinimized = true;
  }
});

// ============================================
// About Dialog
// ============================================
const aboutDialog = document.getElementById('aboutDialog');
const closeAboutBtn = document.getElementById('closeAbout');
const helpMenuItem = document.querySelector('.menu-item[data-menu="help"]');

function showAboutDialog() {
  aboutDialog.style.display = 'flex';
}

function hideAboutDialog() {
  aboutDialog.style.display = 'none';
}

helpMenuItem.addEventListener('click', () => {
  showAboutDialog();
});

closeAboutBtn.addEventListener('click', hideAboutDialog);

aboutDialog.querySelector('.ok-btn').addEventListener('click', hideAboutDialog);

// Close about dialog on overlay click
aboutDialog.querySelector('.dialog-overlay').addEventListener('click', hideAboutDialog);

// ============================================
// Desktop Icons
// ============================================
document.getElementById('helpIcon').addEventListener('dblclick', () => {
  helpdeskWindow.style.display = 'flex';
  taskbarItem.classList.add('active');
  isMinimized = false;
});

document.getElementById('myComputerIcon').addEventListener('dblclick', () => {
  showAboutDialog();
});

document.getElementById('recycleIcon').addEventListener('dblclick', () => {
  alert('Recycle Bin is empty.');
});

document.getElementById('networkIcon').addEventListener('dblclick', () => {
  alert('Network is connected.');
});

// ============================================
// Data Loading Functions
// ============================================
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

// ============================================
// Site Filter Radio Buttons
// ============================================
function populateSiteFilterRadios() {
  const radioContainer = document.getElementById('siteFilterRadios');

  // Keep the "All Sites" option, add other sites after it
  const sortedSites = [...filterOptions.sites].sort();

  sortedSites.forEach((site) => {
    const label = document.createElement('label');
    label.className = 'win95-radio';

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

// ============================================
// Search Functions
// ============================================
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
    return [];
  }
}

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

// ============================================
// Display Results
// ============================================
function displayResults(locationResults, knowledgeResults = []) {
  const resultsContainer = document.getElementById('resultsContainer');
  const searchResultsPanel = document.getElementById('searchResults');
  const noResults = document.getElementById('noResults');
  const resultCount = document.getElementById('resultCount');
  const statusBar = document.querySelector('.status-section');

  // Clear previous results
  resultsContainer.innerHTML = '';

  const hasLocationResults = locationResults.length > 0;
  const hasKnowledgeResults = knowledgeResults.length > 0;
  const totalResults = locationResults.length + knowledgeResults.length;

  if (!hasLocationResults && !hasKnowledgeResults) {
    searchResultsPanel.style.display = 'block';
    noResults.style.display = 'flex';
    resultCount.textContent = '0 object(s)';
    statusBar.textContent = 'No results found';
    return;
  }

  // Hide the no results message and show results
  noResults.style.display = 'none';
  searchResultsPanel.style.display = 'block';
  resultCount.textContent = `${totalResults} object(s)`;
  statusBar.textContent = 'Search complete';

  // Display knowledge base results first if any
  if (hasKnowledgeResults) {
    knowledgeResults.forEach((article) => {
      const kbCard = document.createElement('div');
      kbCard.className = 'kb-result';

      // Format contacts as HTML list if they exist
      let contactsHtml = '';
      if (article.contacts && article.contacts.length > 0) {
        contactsHtml = '<div class="kb-contacts-box"><strong>Contacts:</strong><ul>';
        article.contacts.forEach(contact => {
          contactsHtml += `<li>${contact}</li>`;
        });
        contactsHtml += '</ul></div>';
      }

      kbCard.innerHTML = `
        <div class="kb-result-header">
          <div class="kb-result-icon"></div>
          <span class="kb-result-title">${article.title}</span>
        </div>
        <div class="kb-result-content">
          <div class="kb-result-summary">${article.summary}</div>
          <div class="kb-result-text">${article.content}</div>
          ${contactsHtml}
          ${article.lastUpdated ? `<div class="kb-result-text" style="font-style: italic; font-size: 10px;">Last updated: ${article.lastUpdated}</div>` : ''}
        </div>
      `;

      resultsContainer.appendChild(kbCard);
    });
  }

  // Display location results in table if any
  if (hasLocationResults) {
    const table = document.createElement('table');
    table.className = 'results-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Site</th>
          <th>Location</th>
          <th>Department</th>
          <th>Description</th>
          <th>Room Number</th>
          <th>Floor</th>
        </tr>
      </thead>
      <tbody>
        ${locationResults.map(location => `
          <tr>
            <td>${location['Site'] || '-'}</td>
            <td>${location['Building'] || '-'}</td>
            <td>${location['Department'] || '-'}</td>
            <td>${location['Description'] || '-'}</td>
            <td>${location['Room Num'] || '-'}</td>
            <td>${location['Floor'] || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    resultsContainer.appendChild(table);
  }
}

// ============================================
// Apply Filters and Search
// ============================================
async function applyFilters() {
  const searchInput = document.getElementById('locationSearch');
  const searchTerm = searchInput.value.trim();

  if (searchTerm.length === 0) {
    document.getElementById('searchResults').style.display = 'none';
    document.querySelector('.status-section').textContent = 'Ready';
    return;
  }

  // Search both locations and knowledge base
  const locationResults = await searchLocations(searchTerm);
  const knowledgeResults = await searchKnowledgeBase(searchTerm);
  displayResults(locationResults, knowledgeResults);
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('locationSearch');
  const searchBtn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Search button click handler
  searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm.length === 0) {
      document.getElementById('searchResults').style.display = 'none';
      return;
    }

    // Check for rain animation trigger
    if (searchTerm.toLowerCase() === 'make it rain') {
      // Start the rain animation
      if (window.rainAnimation) {
        window.rainAnimation.start();
      }
    }

    applyFilters();
  });

  // Clear button click handler
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    document.getElementById('searchResults').style.display = 'none';
    document.querySelector('.status-section').textContent = 'Ready';
    searchInput.focus();
  });

  // Search input event handler (Enter key)
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  // Live search as you type
  const debouncedSearch = debounce(() => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm.toLowerCase() === 'make it rain' && window.rainAnimation) {
      window.rainAnimation.start();
    }
    applyFilters();
  }, 300);

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm.length === 0) {
      document.getElementById('searchResults').style.display = 'none';
      document.querySelector('.status-section').textContent = 'Ready';
      return;
    }
    document.querySelector('.status-section').textContent = 'Searching...';
    debouncedSearch();
  });

  // Site filter radio button change handler (delegated event listener)
  document.addEventListener('change', (e) => {
    if (e.target.name === 'siteFilter') {
      activeFilters.site = e.target.value;
      if (searchInput.value.trim().length > 0) {
        applyFilters();
      }
    }
  });

  // No results OK button
  document.querySelector('.no-results .ok-btn').addEventListener('click', () => {
    document.getElementById('noResults').style.display = 'none';
  });

  // Load data on initial page load
  loadLocationData();
  loadKnowledgeBase();

  // Focus search input on page load
  searchInput.focus();
});

// Make loadLocationData available globally for rain animation
window.loadLocationData = loadLocationData;
