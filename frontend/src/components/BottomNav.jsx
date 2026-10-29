import React, { useState, useEffect, useRef } from 'react';

export default function BottomNav({
  savedCount = 0,
  isSavedActive = false,
  onOpenSaved,
  searchTerm = '',
  onSearchChange,
  onOpenFilters
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const lastScrollY = useRef(0);
  const searchInputRef = useRef(null);
  const bottomNavRef = useRef(null);

  // Sync external search term with local state
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Smart Scroll Listener: Hide on Scroll Down, Show on Scroll Up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always show when near the top
          if (currentScrollY <= 60) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY.current + 8) {
            // Scrolling down -> hide bottom bar (unless search modal is actively typing)
            if (!isSearchOpen) {
              setIsVisible(false);
            }
          } else if (currentScrollY < lastScrollY.current - 8) {
            // Scrolling up -> show bottom bar
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchOpen]);

  // Handle focus when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (val) => {
    setLocalSearch(val);
    if (onSearchChange) onSearchChange(val);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) onSearchChange('');
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleSuggestion = (spot) => {
    handleSearchSubmit(spot);
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* Expandable Mobile Search Drawer/Sheet when Search is active */}
      {isSearchOpen && (
        <div className="bottom-search-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="bottom-search-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-search-header">
              <div className="bottom-search-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="bottom-search-input"
                  placeholder="Search spots (KM, Wendani, Ruiru)..."
                  value={localSearch}
                  onChange={(e) => handleSearchSubmit(e.target.value)}
                />
                {localSearch && (
                  <button type="button" className="bottom-search-clear" onClick={handleClearSearch}>
                    ✕
                  </button>
                )}
              </div>
              <button
                type="button"
                className="bottom-search-close-btn"
                onClick={() => setIsSearchOpen(false)}
              >
                Done
              </button>
            </div>

            {/* Quick Chips for Quick Tapping */}
            <div className="bottom-search-chips">
              <span className="chips-title">Popular KU Spots:</span>
              <div className="chips-row">
                {['Transformer (KM)', 'Kwa Symo', 'Magunas', 'Nyayo Gate', 'Bedsitter', 'Single room'].map((spot) => (
                  <button
                    key={spot}
                    type="button"
                    className="bottom-chip"
                    onClick={() => handleSuggestion(spot.replace(/\s*\(KM\)/, ''))}
                  >
                    {spot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <nav
        ref={bottomNavRef}
        className={`mobile-bottom-nav ${isVisible ? 'is-visible' : 'is-hidden'}`}
        aria-label="Mobile Navigation"
      >
        <div className="bottom-nav-inner">
          {/* 1. Search Houses Tab */}
          <button
            type="button"
            className={`bottom-nav-item ${searchTerm ? 'is-active' : ''}`}
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search Houses"
          >
            <div className="bottom-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <span className="bottom-nav-label">
              {searchTerm ? (searchTerm.length > 8 ? `${searchTerm.slice(0, 8)}…` : searchTerm) : 'Search'}
            </span>
          </button>

          {/* 2. Liked / Saved Houses Tab */}
          <button
            type="button"
            className={`bottom-nav-item ${isSavedActive ? 'is-active' : ''}`}
            onClick={onOpenSaved}
            aria-label="Liked Houses"
          >
            <div className="bottom-nav-icon heart-icon-wrap">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={savedCount > 0 ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2.3"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {savedCount > 0 && (
                <span className="bottom-nav-badge">{savedCount}</span>
              )}
            </div>
            <span className="bottom-nav-label">Liked</span>
          </button>

          {/* 3. Filter Options Tab */}
          {onOpenFilters && (
            <button
              type="button"
              className="bottom-nav-item"
              onClick={onOpenFilters}
              aria-label="Filter Options"
            >
              <div className="bottom-nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
              </div>
              <span className="bottom-nav-label">Filters</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
