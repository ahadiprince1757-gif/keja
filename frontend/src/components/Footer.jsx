import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Building, LogIn, UserPlus, AlertCircle } from 'lucide-react';

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
            <div>&copy; 2026 Keja</div>
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
              {isStudent ? <AlertCircle size={28} strokeWidth={2.2} /> : <Building size={28} strokeWidth={2.2} />}
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              {isStudent ? 'Owner / Caretaker Account Required' : 'Owner Account Required'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 24 }}>
              {isStudent
                ? "You are signed in as a student. Only registered property owners or caretakers are authorized to list houses. Please switch to an owner account."
                : "To list a house, manage vacant units, and connect with student tenants, sign in or register as a house owner or caretaker."}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', gap: 8 }}
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate('/login?role=owner');
                }}
                id="footer-modal-btn-signin"
              >
                <LogIn size={16} strokeWidth={2.4} />
                {isStudent ? 'Switch / Sign In as House Owner' : 'Sign In as House Owner'}
              </button>

              <button
                type="button"
                className="btn btn-saved-houses"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', gap: 8 }}
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate('/register?role=owner');
                }}
                id="footer-modal-btn-signup"
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
