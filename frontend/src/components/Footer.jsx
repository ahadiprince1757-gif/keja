import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Building, LogIn, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Footer({ onOpenListHouse }) {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const isStudent = isLoggedIn && user?.role === 'student';

  const handleListHouseClick = () => {
    // If not logged in or logged in as a student, block and prompt owner sign in
    if (!isLoggedIn || isStudent) {
      setShowAuthPrompt(true);
      return;
    }
    if (onOpenListHouse) {
      onOpenListHouse();
    }
  };

  return (
    <>
      <footer className="app-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h4>KejaKU</h4>
              <p>
                An independent student housing directory created to help Kenyatta
                University students find verified rooms, bedsitters, and hostels
                in Wendani, Sukari, and KM without broker exploitation.
              </p>
            </div>

            <div className="footer-links">
              <h5>Popular KU Zones</h5>
              <ul>
                <li><a href="#listingsSection">Kahawa Wendani Hostels</a></li>
                <li><a href="#listingsSection">Kahawa Sukari Apartments</a></li>
                <li><a href="#listingsSection">KM Gate Bedsitters</a></li>
                <li><a href="#listingsSection">Ruiru Student Rentals</a></li>
              </ul>
            </div>

            <div className="footer-actions-col">
              <h5>Property Owners</h5>
              <p style={{ color: '#9ab4a6', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '16px' }}>
                Are you a landlord or property manager around KU? List your vacancies directly to students.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-list-house"
                id="footerBtnListHouse"
                onClick={handleListHouseClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)'
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                List a House
              </button>
            </div>
          </div>

          <div className="footer-bottom">
            <div>&copy; 2026 KejaKU. All rights reserved.</div>
            <div className="footer-admin-link-wrapper">
              <Link
                to={user?.role === 'super_admin' ? '/admin' : '/login'}
                className="footer-admin-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#728c7e',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #10b981)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#728c7e')}
              >
                <ShieldCheck size={14} />
                Super Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Prompt Modal when clicking List a House while not logged in or as a student */}
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
                background: isStudent ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                color: isStudent ? '#ef4444' : 'var(--primary, #22c55e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                border: isStudent ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(34, 197, 94, 0.25)'
              }}
            >
              {isStudent ? <AlertCircle size={28} /> : <Building size={28} />}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
              {isStudent ? 'House Owner Account Required' : 'List Your Rental on KejaKU'}
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {isStudent
                ? 'You are currently signed in as a student. To add and manage property listings, please sign in with or create a House Owner account.'
                : 'Sign in to your House Owner account to post new vacancies, update rental details, and connect directly with KU students.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate('/login?role=owner');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                <LogIn size={16} />
                Sign In as House Owner
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate('/register?role=owner');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                <UserPlus size={16} />
                Create Landlord Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
