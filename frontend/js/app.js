/**
 * Main Application Orchestrator
 * Connects modular components, manages state, and drives the UI
 */

import { defaultHouses } from './data/houses.js';
import { createHouseCard, formatMoney } from './components/card.js';
import { filterHouses } from './components/filters.js';
import { toggleSaveHouse, updateSavedBadgeCount, isSaved } from './components/saved.js';
import {
  initModal,
  showHouseDetails,
  showEnquiryModal,
  showListHouseModal,
  showReportModal,
  closeModal
} from './components/modal.js';
import { showToast } from './toast.js';

// Application State
const state = {
  houses: [...defaultHouses],
  filters: {
    keyword: '',
    area: '',
    type: '',
    minRent: 0,
    maxRent: 15000,
    verifiedOnly: false,
    savedOnly: false,
    sortBy: 'recommended'
  }
};

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', () => {
  initModal();
  updateSavedBadgeCount();
  setupEventListeners();
  renderListings();
});

/**
 * Setup All UI Event Listeners
 */
function setupEventListeners() {
  // Mobile Filter Drawer Toggle
  const btnMobileFilters = document.getElementById('btnMobileFilters');
  const filterCard = document.getElementById('filterCard');
  if (btnMobileFilters && filterCard) {
    btnMobileFilters.addEventListener('click', () => {
      filterCard.classList.toggle('open-mobile');
      btnMobileFilters.textContent = filterCard.classList.contains('open-mobile')
        ? 'Hide Filter Options ▲'
        : 'Show Filter Options ▼';
    });
  }

  // Sidebar Keyword Search with instant live filter
  const filterSearch = document.getElementById('filterSearch');
  if (filterSearch) {
    filterSearch.addEventListener('input', (e) => {
      state.filters.keyword = e.target.value;
      renderListings();
    });
  }

  // Sidebar Area Select
  const filterArea = document.getElementById('filterArea');
  if (filterArea) {
    filterArea.addEventListener('change', (e) => {
      state.filters.area = e.target.value;
      // Sync hero area
      const heroArea = document.getElementById('heroArea');
      if (heroArea) heroArea.value = e.target.value;
      renderListings();
    });
  }

  // Sidebar Type Select
  const filterType = document.getElementById('filterType');
  if (filterType) {
    filterType.addEventListener('change', (e) => {
      state.filters.type = e.target.value;
      // Sync chip state
      updateChipActiveState(e.target.value);
      // Sync hero type
      const heroType = document.getElementById('heroType');
      if (heroType) heroType.value = e.target.value;
      renderListings();
    });
  }

  // Price Range Slider
  const priceRange = document.getElementById('priceRange');
  const priceDisplay = document.getElementById('priceDisplay');
  if (priceRange && priceDisplay) {
    priceRange.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.filters.maxRent = val;
      priceDisplay.textContent = formatMoney(val);
      renderListings();
    });
  }

  // Verified Only Checkbox
  const verifiedOnly = document.getElementById('verifiedOnly');
  if (verifiedOnly) {
    verifiedOnly.addEventListener('change', (e) => {
      state.filters.verifiedOnly = e.target.checked;
      renderListings();
    });
  }

  // Sort By Select
  const sortBy = document.getElementById('sortBy');
  if (sortBy) {
    sortBy.addEventListener('change', (e) => {
      state.filters.sortBy = e.target.value;
      renderListings();
    });
  }

  // Quick Filter Chips (All, Bedsitter, Single room, Shared, Hostel)
  const chipsContainer = document.getElementById('filterChips');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      const typeVal = chip.dataset.type || '';
      state.filters.type = typeVal;

      if (filterType) filterType.value = typeVal;
      const heroType = document.getElementById('heroType');
      if (heroType) heroType.value = typeVal;

      updateChipActiveState(typeVal);
      renderListings();
    });
  }

  // Reset Filters Button
  const btnResetFilters = document.getElementById('btnResetFilters');
  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', resetAllFilters);
  }

  // Hero Search Box
  const btnHeroSearch = document.getElementById('btnHeroSearch');
  if (btnHeroSearch) {
    btnHeroSearch.addEventListener('click', () => {
      const heroArea = document.getElementById('heroArea')?.value || '';
      const heroType = document.getElementById('heroType')?.value || '';
      const heroMaxBudget = Number(document.getElementById('heroMaxBudget')?.value || 15000);
      const heroKeyword = document.getElementById('heroKeyword')?.value || '';

      state.filters.area = heroArea;
      state.filters.type = heroType;
      state.filters.maxRent = heroMaxBudget;
      state.filters.keyword = heroKeyword;
      state.filters.savedOnly = false;

      // Sync sidebar
      if (filterArea) filterArea.value = heroArea;
      if (filterType) filterType.value = heroType;
      if (filterSearch) filterSearch.value = heroKeyword;
      if (priceRange) {
        priceRange.value = heroMaxBudget;
        if (priceDisplay) priceDisplay.textContent = formatMoney(heroMaxBudget);
      }
      updateChipActiveState(heroType);

      renderListings();

      // Smooth scroll to listings
      document.getElementById('listingsSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Saved Houses Button in Header
  const btnSavedHouses = document.getElementById('btnSavedHouses');
  if (btnSavedHouses) {
    btnSavedHouses.addEventListener('click', () => {
      state.filters.savedOnly = !state.filters.savedOnly;

      const btnText = btnSavedHouses.querySelector('.btn-label');
      if (btnText) {
        btnText.textContent = state.filters.savedOnly ? 'Show All Houses' : 'Saved Houses';
      }

      renderListings();
      document.getElementById('listingsSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // List House Button in Header
  const btnListHouse = document.getElementById('btnListHouse');
  if (btnListHouse) {
    btnListHouse.addEventListener('click', () => {
      showListHouseModal((newHouse) => {
        state.houses.unshift(newHouse);
        renderListings();
        document.getElementById('listingsSection')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // Floating Report Scam Button
  const btnFloatingReport = document.getElementById('btnFloatingReport');
  if (btnFloatingReport) {
    btnFloatingReport.addEventListener('click', () => {
      showReportModal();
    });
  }

  // Modal Close Button in DOM
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // Listings Grid Event Delegation (Details, Enquire, Save)
  const listingsGrid = document.getElementById('listingsGrid');
  if (listingsGrid) {
    listingsGrid.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('button[data-action]');
      if (!targetBtn) return;

      const action = targetBtn.dataset.action;
      const houseId = Number(targetBtn.dataset.id);
      const house = state.houses.find(h => h.id === houseId);
      if (!house) return;

      if (action === 'details') {
        showHouseDetails(house);
      } else if (action === 'enquire') {
        showEnquiryModal(house);
      } else if (action === 'toggle-save') {
        const nowSaved = toggleSaveHouse(house.id, house.title);
        targetBtn.classList.toggle('is-saved', nowSaved);
        targetBtn.setAttribute('title', nowSaved ? 'Remove from saved' : 'Save house');
        const svg = targetBtn.querySelector('svg');
        if (svg) svg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');

        // If in savedOnly mode, re-render to update the list immediately
        if (state.filters.savedOnly) {
          renderListings();
        }
      }
    });
  }
}

/**
 * Render Listings with Current Filters & State
 */
function renderListings() {
  const container = document.getElementById('listingsGrid');
  const countBadge = document.getElementById('resultsCountBadge');
  const sectionTitle = document.getElementById('resultsSectionTitle');
  if (!container) return;

  const results = filterHouses(state.houses, state.filters);

  // Update headers
  if (sectionTitle) {
    sectionTitle.textContent = state.filters.savedOnly
      ? 'Your Bookmarked Houses'
      : 'Available Student Rentals';
  }

  if (countBadge) {
    countBadge.textContent = `${results.length} ${results.length === 1 ? 'property found' : 'properties found'}`;
  }

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3>No properties match your filters</h3>
        <p>Try widening your search budget, selecting all areas, or clearing specific filters.</p>
        <button type="button" class="btn btn-primary" id="btnEmptyReset">
          Reset All Filters
        </button>
      </div>
    `;

    const btnEmptyReset = document.getElementById('btnEmptyReset');
    if (btnEmptyReset) {
      btnEmptyReset.addEventListener('click', resetAllFilters);
    }
    return;
  }

  container.innerHTML = results.map(house => createHouseCard(house)).join('');
}

/**
 * Reset All Filter Controls
 */
function resetAllFilters() {
  state.filters = {
    keyword: '',
    area: '',
    type: '',
    minRent: 0,
    maxRent: 15000,
    verifiedOnly: false,
    savedOnly: false,
    sortBy: 'recommended'
  };

  const filterSearch = document.getElementById('filterSearch');
  if (filterSearch) filterSearch.value = '';

  const heroKeyword = document.getElementById('heroKeyword');
  if (heroKeyword) heroKeyword.value = '';

  const filterArea = document.getElementById('filterArea');
  if (filterArea) filterArea.value = '';

  const heroArea = document.getElementById('heroArea');
  if (heroArea) heroArea.value = '';

  const filterType = document.getElementById('filterType');
  if (filterType) filterType.value = '';

  const heroType = document.getElementById('heroType');
  if (heroType) heroType.value = '';

  const priceRange = document.getElementById('priceRange');
  if (priceRange) priceRange.value = 15000;

  const priceDisplay = document.getElementById('priceDisplay');
  if (priceDisplay) priceDisplay.textContent = formatMoney(15000);

  const heroMaxBudget = document.getElementById('heroMaxBudget');
  if (heroMaxBudget) heroMaxBudget.value = '';

  const verifiedOnly = document.getElementById('verifiedOnly');
  if (verifiedOnly) verifiedOnly.checked = false;

  const sortBy = document.getElementById('sortBy');
  if (sortBy) sortBy.value = 'recommended';

  const btnSavedHouses = document.getElementById('btnSavedHouses');
  if (btnSavedHouses) {
    const btnText = btnSavedHouses.querySelector('.btn-label');
    if (btnText) btnText.textContent = 'Saved Houses';
  }

  updateChipActiveState('');
  renderListings();
  showToast('Filters cleared');
}

/**
 * Update Active State on Chip Elements
 */
function updateChipActiveState(selectedType) {
  const chips = document.querySelectorAll('#filterChips .chip');
  chips.forEach(chip => {
    const chipType = chip.dataset.type || '';
    if (chipType === selectedType) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}
