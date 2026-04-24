function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

let allLocations = [];
let knowledgeBaseArticles = [];
let filterOptions = { sites: new Set() };
let activeFilters = { site: '' };

// ============================================
// Data Loading
// ============================================
async function loadLocationData() {
  try {
    const response = await fetch('locations.csv');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();

    const lines = csvText.split('\n');
    filterOptions = { sites: new Set() };
    allLocations = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.replace(/^["']|["']$/g, '').trim());
      const mappedLocation = {
        Site: values[0] || '-',
        Building: values[1] || '-',
        Floor: values[2] || '-',
        Description: values[4] || '-',
        'Room Num': values[5] || '-',
        Department: (values[9] || '-').replace(/["']/g, ''),
      };
      allLocations.push(mappedLocation);
      if (mappedLocation.Site !== '-') filterOptions.sites.add(mappedLocation.Site);
    }
    return allLocations;
  } catch (error) {
    console.error('Error loading location data:', error);
    throw error;
  }
}

async function loadKnowledgeBase() {
  try {
    const response = await fetch('knowledge-base.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    knowledgeBaseArticles = data.articles || [];
    return knowledgeBaseArticles;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return [];
  }
}

// ============================================
// Search
// ============================================
async function searchLocations(searchTerm) {
  try {
    if (allLocations.length === 0) await loadLocationData();
    searchTerm = searchTerm.toLowerCase();
    return allLocations.filter(location => {
      if (activeFilters.site && location.Site !== activeFilters.site) return false;
      return (
        location.Site?.toLowerCase().includes(searchTerm) ||
        location.Building?.toLowerCase().includes(searchTerm) ||
        location.Department?.toLowerCase().includes(searchTerm) ||
        location.Description?.toLowerCase().includes(searchTerm) ||
        location['Room Num']?.toLowerCase().includes(searchTerm) ||
        location.Floor?.toLowerCase().includes(searchTerm)
      );
    });
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

async function searchKnowledgeBase(searchTerm) {
  try {
    if (knowledgeBaseArticles.length === 0) await loadKnowledgeBase();
    searchTerm = searchTerm.toLowerCase();
    return knowledgeBaseArticles.filter(article =>
      article.title?.toLowerCase().includes(searchTerm) ||
      article.summary?.toLowerCase().includes(searchTerm) ||
      article.content?.toLowerCase().includes(searchTerm) ||
      article.category?.toLowerCase().includes(searchTerm) ||
      article.keywords?.some(k => k.toLowerCase().includes(searchTerm))
    );
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
  const statusText = document.getElementById('statusText');
  const app = document.getElementById('app');

  resultsContainer.innerHTML = '';
  const totalResults = locationResults.length + knowledgeResults.length;

  app.classList.add('has-results');

  if (totalResults === 0) {
    searchResultsPanel.style.display = 'block';
    noResults.style.display = 'flex';
    statusText.textContent = '';
    return;
  }

  noResults.style.display = 'none';
  searchResultsPanel.style.display = 'block';
  statusText.textContent = `${totalResults} result${totalResults !== 1 ? 's' : ''}`;

  knowledgeResults.forEach(article => {
    const kbCard = document.createElement('div');
    kbCard.className = 'kb-result';

    let contactsHtml = '';
    if (article.contacts?.length > 0) {
      contactsHtml = '<div class="kb-contacts-box"><strong>Contacts:</strong><ul>' +
        article.contacts.map(c => `<li>${c}</li>`).join('') +
        '</ul></div>';
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
        ${article.lastUpdated ? `<div class="kb-result-text" style="font-style: italic; font-size: 0.8rem; color: var(--text-muted);">Last updated: ${article.lastUpdated}</div>` : ''}
      </div>
    `;
    resultsContainer.appendChild(kbCard);
  });

  if (locationResults.length > 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'results-table-wrapper';

    const table = document.createElement('table');
    table.className = 'results-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Site</th>
          <th>Building</th>
          <th>Department</th>
          <th>Description</th>
          <th>Room</th>
          <th>Floor</th>
        </tr>
      </thead>
      <tbody>
        ${locationResults.map(l => `
          <tr>
            <td>${l.Site || '-'}</td>
            <td>${l.Building || '-'}</td>
            <td>${l.Department || '-'}</td>
            <td>${l.Description || '-'}</td>
            <td>${l['Room Num'] || '-'}</td>
            <td>${l.Floor || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    wrapper.appendChild(table);
    resultsContainer.appendChild(wrapper);
  }
}

// ============================================
// Apply Filters and Search
// ============================================
async function applyFilters() {
  const searchInput = document.getElementById('locationSearch');
  const searchTerm = searchInput.value.trim();
  const app = document.getElementById('app');

  if (searchTerm.length === 0) {
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('statusText').textContent = '';
    app.classList.remove('has-results');
    return;
  }

  const [locationResults, knowledgeResults] = await Promise.all([
    searchLocations(searchTerm),
    searchKnowledgeBase(searchTerm),
  ]);
  displayResults(locationResults, knowledgeResults);
}

// ============================================
// Init
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('locationSearch');
  const clearBtn = document.getElementById('clearBtn');
  const app = document.getElementById('app');

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.site = btn.dataset.site;
      if (searchInput.value.trim().length > 0) applyFilters();
    });
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('statusText').textContent = '';
    app.classList.remove('has-results');
    searchInput.focus();
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyFilters();
  });

  const debouncedSearch = debounce(() => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm.toLowerCase() === 'make it rain' && window.rainAnimation) {
      window.rainAnimation.start();
    }
    applyFilters();
  }, 300);

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim();
    clearBtn.style.display = searchTerm.length > 0 ? 'flex' : 'none';
    if (searchTerm.length === 0) {
      document.getElementById('searchResults').style.display = 'none';
      document.getElementById('statusText').textContent = '';
      app.classList.remove('has-results');
      return;
    }
    document.getElementById('statusText').textContent = 'Searching...';
    debouncedSearch();
  });

  loadLocationData();
  loadKnowledgeBase();
  searchInput.focus();
});

window.loadLocationData = loadLocationData;
