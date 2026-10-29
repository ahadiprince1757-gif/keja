import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Building2, MessageSquare, UserCheck } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard',           icon: LayoutDashboard, label: 'Overview'   },
  { path: '/dashboard/houses',    icon: Building2,       label: 'My Houses'  },
  { path: '/dashboard/enquiries', icon: MessageSquare,   label: 'Enquiries'  },
  { path: '/dashboard/profile',   icon: UserCheck,       label: 'Profile'    },
];

export default function OwnerSidebar({ enquiryCount = 0, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`dashboard-sidebar${isOpen ? ' open' : ''}`} aria-label="Dashboard navigation">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand" onClick={onClose}>
          <div className="sidebar-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="sidebar-brand-text">KejaKU</div>
        </Link>

        <div className="sidebar-user">
          <div className="sidebar-avatar" aria-hidden="true">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name" title={user?.name}>{user?.name || 'Owner'}</div>
            <div className="sidebar-user-role">House Owner</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section-label">Menu</div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-link${isActive(item.path) ? ' active' : ''}`}
              onClick={onClose}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <Icon size={18} strokeWidth={2.2} />
              </span>
              {item.label}
              {item.path === '/dashboard/enquiries' && enquiryCount > 0 && (
                <span className="sidebar-nav-badge">{enquiryCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="btn-sidebar-logout"
          id="btn-dashboard-logout"
          onClick={handleLogout}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  );
}
