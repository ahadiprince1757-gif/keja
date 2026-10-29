import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  X,
  MapPin,
  Home,
  Heart,
  Plus,
  User,
  LogIn,
  UserPlus,
  Building,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({
  savedCount,
  onOpenSaved,
  onOpenListHouse,
  searchTerm = '',
  onSearchChange
}) {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [internalTerm, setInternalTerm] = useState(searchTerm);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
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

  const handleListHouseClick = () => {
    if (!isLoggedIn) {
      setShowAuthPrompt(true);
      return;
    }
    if (onOpenListHouse) {
      onOpenListHouse();
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="nav-container">
          <Link to="/" className="brand" aria-label="KejaKU Home">
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
          </Link>

          {/* Expandable Search Bar */}
          <div className={`nav-search-wrapper ${isSearchExpanded ? 'is-expanded' : ''}`} ref={searchRef}>
            <div className="nav-search-bar" onClick={handleExpand}>
              <span className="search-icon">
                <Search size={17} strokeWidth={2.5} />
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
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Suggestions Dropdown */}
            {isSearchExpanded && (
              <div className="search-suggestions-dropdown">
                <div className="suggestions-section">
                  <div className="suggestions-header">
                    <span className="suggestions-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--primary)" /> KM Spots
                    </span>
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
                    <span className="suggestions-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--primary)" /> Wendani & Sukari
                    </span>
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
                    <span className="suggestions-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Home size={14} color="var(--primary)" /> Popular Types & Amenities
                    </span>
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
              <Heart size={16} className="heart-icon" fill="currentColor" />
              <span className="btn-label">Saved Houses</span>
              <span className="saved-count-pill" id="savedCountPill">{savedCount}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-list-house"
              id="btnListHouse"
              onClick={handleListHouseClick}
            >
              <Plus size={16} strokeWidth={2.5} />
              List a House
            </button>

            {isLoggedIn && (
              <Link
                to="/dashboard"
                className="btn btn-saved-houses"
                id="nav-dashboard-link"
                style={{ textDecoration: 'none', gap: '8px' }}
              >
                <User size={16} strokeWidth={2.2} />
                <span className="btn-label">{user?.name?.split(' ')[0] || 'Dashboard'}</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Auth Prompt Modal when clicking List a House while not logged in */}
      {showAuthPrompt && (
        <div
          className="modal-backdrop open"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAuthPrompt(false); }}
          style={{ zIndex: 1200 }}
        >
          <div className="modal-container" style={{ maxWidth: '440px', textAlign: 'center', padding: '32px 28px' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                border: '1px solid rgba(34, 197, 94, 0.25)'
              }}
            >
              <Building size={28} strokeWidth={2.2} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Owner Account Required
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 24 }}>
              To list a house or apartment, manage vacant units, and chat with prospective student tenants, you need to sign in or create an owner account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', gap: 8 }}
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate('/login');
                }}
                id="modal-btn-signin"
              >
                <LogIn size={16} strokeWidth={2.4} />
                Sign In to Your Account
              </button>

              <button
                type="button"
                className="btn btn-saved-houses"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', gap: 8 }}
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate('/register');
                }}
                id="modal-btn-signup"
              >
                <UserPlus size={16} strokeWidth={2.2} />
                Create New Owner Account
              </button>

              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  padding: '8px',
                  cursor: 'pointer',
                  marginTop: 6
                }}
                onClick={() => setShowAuthPrompt(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
