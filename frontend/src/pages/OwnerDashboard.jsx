import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import OwnerSidebar    from '../components/OwnerSidebar';
import MyHousesPage    from './MyHousesPage';
import EnquiryChatPage from './EnquiryChatPage';
import ProfilePage     from './ProfilePage';
import { useAuth }     from '../context/AuthContext';
import { Building2, MessageSquare, Mail, Home } from 'lucide-react';

// ── Overview / home ───────────────────────────────────────────────────────────
function OverviewPage({ stats }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
        {greeting()}, {user?.name?.split(' ')[0]}
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.9rem' }}>
        Here's what's happening with your houses today.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-value">{stats.houses}</div>
          <div className="stat-label">Total Houses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={24} />
          </div>
          <div className="stat-value">{stats.enquiries}</div>
          <div className="stat-label">Total Messages</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={24} />
          </div>
          <div className="stat-value">{stats.open}</div>
          <div className="stat-label">Unread Messages</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <button
          type="button"
          className="stat-card"
          style={{ cursor: 'pointer', textAlign: 'left', border: '2px dashed var(--border-subtle)', background: 'transparent' }}
          onClick={() => navigate('/dashboard/houses')}
          id="btn-go-houses"
        >
          <div style={{ color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
            <Building2 size={30} strokeWidth={2.2} />
          </div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>My Houses</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Add, edit or remove your houses</div>
        </button>
        <button
          type="button"
          className="stat-card"
          style={{ cursor: 'pointer', textAlign: 'left', border: '2px dashed var(--border-subtle)', background: 'transparent' }}
          onClick={() => navigate('/dashboard/enquiries')}
          id="btn-go-enquiries"
        >
          <div style={{ color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
            <MessageSquare size={30} strokeWidth={2.2} />
          </div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>View Messages</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Reply to student messages</div>
        </button>
      </div>
    </div>
  );
}

// ── Page titles by route ───────────────────────────────────────────────────────
const TITLES = {
  '/dashboard':           'Overview',
  '/dashboard/houses':    'My Houses',
  '/dashboard/enquiries': 'Messages',
  '/dashboard/profile':   'Profile',
};

// ── Main dashboard shell ───────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const { authFetch } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats]             = useState({ houses: 0, enquiries: 0, open: 0 });
  const [enquiryCount, setEnquiryCount] = useState(0);

  // Determine title from current path
  const path = window.location.pathname;
  const pageTitle = Object.entries(TITLES).find(([k]) => path === k || (k !== '/dashboard' && path.startsWith(k)))?.[1] || 'Dashboard';

  useEffect(() => {
    // Fetch overview stats in parallel
    Promise.all([
      authFetch('/api/accounts/me/houses').then(r => r.json()),
      authFetch('/api/accounts/me/enquiries').then(r => r.json()),
    ]).then(([housesData, enquiriesData]) => {
      const h = housesData.success  ? housesData.data.length   : 0;
      const e = enquiriesData.success ? enquiriesData.data.length : 0;
      const o = enquiriesData.success ? enquiriesData.data.filter(x => x.status === 'open').length : 0;
      setStats({ houses: h, enquiries: e, open: o });
      setEnquiryCount(o);
    }).catch(console.error);
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 299 }}
        />
      )}

      <OwnerSidebar
        enquiryCount={enquiryCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-title">{pageTitle}</div>
          <div className="dashboard-topbar-sub">KejaKU Owner Portal</div>
        </header>

        <main className="dashboard-content">
          <Routes>
            <Route index        element={<OverviewPage stats={stats} />} />
            <Route path="houses"    element={<MyHousesPage />} />
            <Route path="enquiries" element={<EnquiryChatPage />} />
            <Route path="profile"   element={<ProfilePage />} />
          </Routes>
        </main>
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-label="Toggle sidebar"
        id="btn-sidebar-toggle"
      >
        ☰
      </button>
    </div>
  );
}
