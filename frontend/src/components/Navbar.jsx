import React, { useState, useRef, useEffect } from 'react';

export default function Navbar({
  savedCount,
  onOpenSaved,
  onOpenListHouse,
  searchTerm = '',
  onSearchChange
}) {
  const [internalTerm, setInternalTerm] = useState(searchTerm);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Sync internal state with external prop if provided
  useEffect(() => {
    setInternalTerm(searchTerm);
  }, [searchTerm]);

  // Click outside to collapse suggestion box
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExpand = () => {
    setIsSearchExpanded(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInternalTerm('');
    if (onSearchChange) onSearchChange('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchExpanded(false);
      if (inputRef.current) inputRef.current.blur();
    }
  };

  const handleInputChange = (val) => {
    setInternalTerm(val);
    if (onSearchChange) onSearchChange(val);
  };

  const handleSuggestionClick = (keyword) => {
    setInternalTerm(keyword);
    if (onSearchChange) onSearchChange(keyword);
    setIsSearchExpanded(false);
  };
  return (
    <header className="app-header">
      <div className="nav-container">
        <a href="#" className="brand" aria-label="KejaKU Home">
          <div className="brand-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div className="brand-text">Keja</div>
        </a>

        {/* Expandable Search Bar */}
        <div className={`nav-search-wrapper ${isSearchExpanded ? 'is-expanded' : ''}`} ref={searchRef}>
          <div className="nav-search-bar" onClick={handleExpand}>
            <span className="search-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              className="nav-search-input"
              placeholder="Search houses, KM, Wendani..."
              value={internalTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsSearchExpanded(true)}
              onKeyDown={handleKeyDown}
              aria-label="Search properties"
            />
            {internalTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClear}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Suggestions Dropdown (Phase 2) */}
          {isSearchExpanded && (
            <div className="search-suggestions-dropdown">
              <div className="suggestions-section">
                <div className="suggestions-header">
                  <span className="suggestions-label">📍 KM Spots</span>
                </div>
                <div className="suggestion-chips">
                  {['Transformer', 'Kwa Symo', 'Madhe', 'Small Gate', 'Modern Furniture', 'Kiwanja'].map((spot) => (
                    <button
                      key={spot}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(spot)}
                    >
                      {spot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="suggestions-section">
                <div className="suggestions-header">
                  <span className="suggestions-label">📍 Wendani & Sukari</span>
                </div>
                <div className="suggestion-chips">
                  {['Magunas', 'Matopeni', 'Quickmart', 'Clean Shelf', 'Sukari Avenue'].map((spot) => (
                    <button
                      key={spot}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(spot)}
                    >
                      {spot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="suggestions-section">
                <div className="suggestions-header">
                  <span className="suggestions-label">🏠 Popular Types & Amenities</span>
                </div>
                <div className="suggestion-chips">
                  {['Bedsitter', 'Single room', 'Free WiFi', 'Prepaid Tokens', 'Borehole Water'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="nav-actions">
          <button
            type="button"
            className="btn btn-saved-houses"
            id="btnSavedHouses"
            onClick={onOpenSaved}
          >
            <span className="heart-icon">♥</span>
            <span className="btn-label">Saved Houses</span>
            <span className="saved-count-pill" id="savedCountPill">{savedCount}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-list-house"
            id="btnListHouse"
            onClick={onOpenListHouse}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            List a House
          </button>
        </nav>
      </div>
    </header>
  );
}
