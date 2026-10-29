import React from 'react';

const ROOM_TYPES = [
  { label: 'All', value: '' },
  { label: 'Single', value: 'Single room' },
  { label: 'Bedsitter', value: 'Bedsitter' },
  { label: 'Hostel', value: 'Hostel' },
  { label: 'Shared', value: 'Shared room' },
  { label: '1 Bed', value: '1 Bedroom' }
];

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  isOpenMobile,
  onToggleMobile
}) {
  return (
    <>
      <button
        type="button"
        className="btn btn-mobile-filters"
        id="btnMobileFilters"
        onClick={onToggleMobile}
      >
        {isOpenMobile ? 'Filter Options ▲' : 'Filter Options ▼'}
      </button>

      <aside className={`filter-card ${isOpenMobile ? 'open-mobile' : ''}`} id="filterCard">
        <div className="filter-header">
          <h3>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter Houses
          </h3>
          <button
            type="button"
            className="btn btn-ghost btn-reset-filters"
            id="btnResetFilters"
            onClick={onReset}
          >
            Clear All
          </button>
        </div>

        {/* Live Keyword Search */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filterSearch">Quick Search</label>
          <div className="search-input-wrapper">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="filterSearch"
              className="input-control"
              placeholder="Search keywords..."
              value={filters.keyword}
              onChange={(e) => onChange('keyword', e.target.value)}
            />
          </div>
        </div>

        {/* Quick Type Chips */}
        <div className="filter-group">
          <label className="filter-label">Room Type</label>
          <div className="filter-chips" id="filterChips">
            {ROOM_TYPES.map((chip) => (
              <span
                key={chip.label}
                className={`chip ${filters.type === chip.value ? 'active' : ''}`}
                onClick={() => onChange('type', chip.value)}
                style={{ cursor: 'pointer' }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        {/* Area Selector */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filterArea">
            Area / Neighborhood
          </label>
          <select
            id="filterArea"
            className="input-control"
            value={filters.area}
            onChange={(e) => onChange('area', e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="Kahawa Wendani">Kahawa Wendani</option>
            <option value="Kahawa Sukari">Kahawa Sukari</option>
            <option value="Near KU main gate">Near KU Main Gate (KM)</option>
            <option value="Ruiru">Ruiru</option>
          </select>
        </div>

        {/* Room Type Dropdown */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filterType">
            Room Category
          </label>
          <select
            id="filterType"
            className="input-control"
            value={filters.type}
            onChange={(e) => onChange('type', e.target.value)}
          >
            <option value="">All Room Types</option>
            <option value="Single room">Single room</option>
            <option value="Bedsitter">Bedsitter</option>
            <option value="Hostel">Hostel</option>
            <option value="Shared room">Shared room</option>
            <option value="1 Bedroom">1 Bedroom</option>
          </select>
        </div>

        {/* Price Range Slider */}
        <div className="filter-group">
          <label className="filter-label">Monthly Rent Limit</label>
          <div className="price-slider-wrapper">
            <div className="price-range-values">
              <span>Up to:</span>
              <span className="price-current-value" id="priceDisplay">
                KSh {Number(filters.maxRent).toLocaleString('en-KE')}
              </span>
            </div>
            <input
              type="range"
              id="priceRange"
              className="range-slider"
              min="2000"
              max="15000"
              step="500"
              value={filters.maxRent}
              onChange={(e) => onChange('maxRent', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Verification Filter */}
        <div className="filter-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              id="verifiedOnly"
              checked={filters.verifiedOnly}
              onChange={(e) => onChange('verifiedOnly', e.target.checked)}
            />
            <span>Show Physical-Visit Verified Only</span>
          </label>
        </div>
      </aside>
    </>
  );
}
