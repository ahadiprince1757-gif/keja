import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  X,
  MapPin,
  Home,
  Heart,
  User,
  LogIn,
  GraduationCap,
  Building,
  LogOut
} from 'lucide-react';

export default function Navbar({
  savedCount,
  onOpenSaved,
  searchTerm = '',
  onSearchChange
}) {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [internalTerm, setInternalTerm] = useState(searchTerm);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleMode, setRoleMode] = useState('signin'); // 'signin' or 'signup'
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
              className="btn btn-saved-houses nav-saved-btn"
              id="btnSavedHouses"
              onClick={onOpenSaved}
            >
              <Heart size={16} className="heart-icon" fill="currentColor" />
              <span className="btn-label">Saved Houses</span>
              <span className="saved-count-pill" id="savedCountPill">{savedCount}</span>
            </button>

            {isLoggedIn ? (
              <div className="nav-user-account" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {user?.role === 'owner' ? (
                  <Link
                    to="/dashboard"
                    className="btn nav-user-btn"
                    id="nav-dashboard-link"
                    style={{ textDecoration: 'none' }}
                    title={`Dashboard (${user?.name || 'Owner'})`}
                  >
                    <User size={16} strokeWidth={2.2} />
                    <span className="user-name-text">{user?.name?.split(' ')[0] || 'Dashboard'}</span>
                  </Link>
                ) : (
                  <Link
                    to="/account"
                    className="btn nav-user-btn nav-user-student"
                    id="nav-student-link"
                    style={{ textDecoration: 'none' }}
                    title={`My Account (${user?.name || 'Student'})`}
                  >
                    <User size={16} strokeWidth={2.2} />
                    <span className="user-name-text">{user?.name?.split(' ')[0] || 'Account'}</span>
                  </Link>
                )}
                <button
                  type="button"
                  className="btn nav-logout-btn"
                  onClick={logout}
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={15} strokeWidth={2.2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn nav-login-btn"
                id="nav-login-btn"
                onClick={() => {
                  setRoleMode('signin');
                  setShowRoleModal(true);
                }}
              >
                <LogIn size={16} strokeWidth={2.2} />
                <span className="login-text">Sign In</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Role Selection Modal: Choose between Student or House Owner */}
      {showRoleModal && (
        <div
          className="modal-backdrop open"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRoleModal(false); }}
          style={{ zIndex: 1250 }}
        >
          <div className="modal-container" style={{ maxWidth: '420px', padding: '24px 22px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                {roleMode === 'signin' ? 'Sign In to KejaKU' : 'Create an Account'}
              </h3>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 18 }}>
              {roleMode === 'signin'
                ? 'Choose your account type:'
                : 'Select your account type:'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: 18 }}>
              {/* Option 1: Student */}
              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false);
                  const path = roleMode === 'signin' ? '/login?role=student' : '/register?role=student';
                  navigate(path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1.5px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'inherit',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary, #6366f1)';
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '8px',
                  background: 'var(--primary, #6366f1)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <GraduationCap size={20} strokeWidth={2.4} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {roleMode === 'signin' ? 'Sign In as Student' : 'Sign Up as Student'}
                </div>
              </button>

              {/* Option 2: House Owner */}
              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false);
                  const path = roleMode === 'signin' ? '/login?role=owner' : '/register?role=owner';
                  navigate(path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1.5px solid rgba(34, 197, 94, 0.25)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'inherit',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#22c55e';
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.25)';
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)';
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '8px',
                  background: '#22c55e',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Building size={20} strokeWidth={2.4} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {roleMode === 'signin' ? 'Sign In as House Owner' : 'Sign Up as House Owner'}
                </div>
              </button>
            </div>

            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              {roleMode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setRoleMode('signup')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary, #6366f1)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setRoleMode('signin')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary, #6366f1)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
