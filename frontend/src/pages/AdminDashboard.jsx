import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Home,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  ExternalLink,
  LogOut,
  RefreshCw,
  Building2,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'houses' | 'users' | 'enquiries'
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Houses State
  const [houses, setHouses] = useState([]);
  const [houseFilter, setHouseFilter] = useState('all');
  const [houseSearch, setHouseSearch] = useState('');
  const [housesLoading, setHousesLoading] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Enquiries State
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

  // General Notification Banner
  const [alertMessage, setAlertMessage] = useState(null);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchHouses = async () => {
    try {
      setHousesLoading(true);
      const params = new URLSearchParams();
      if (houseFilter !== 'all') params.append('status', houseFilter);
      if (houseSearch.trim()) params.append('search', houseSearch.trim());

      const res = await fetch(`/api/admin/houses?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHouses(data.houses);
      }
    } catch (err) {
      console.error('Failed to load houses:', err);
    } finally {
      setHousesLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (userRoleFilter !== 'all') params.append('role', userRoleFilter);
      if (userSearch.trim()) params.append('search', userSearch.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      setEnquiriesLoading(true);
      const res = await fetch('/api/admin/enquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'houses' || activeTab === 'overview') fetchHouses();
    if (activeTab === 'users' || activeTab === 'overview') fetchUsers();
    if (activeTab === 'enquiries') fetchEnquiries();
  }, [activeTab]);

  const handleToggleVerify = async (houseId, currentStatus) => {
    const nextStatus = currentStatus === 'verified' ? 'visited' : 'verified';
    try {
      const res = await fetch(`/api/admin/houses/${houseId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setHouses(prev =>
          prev.map(h => (h.id === houseId ? { ...h, status: nextStatus } : h))
        );
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update verification status:', err);
    }
  };

  const handleDeleteHouse = async (houseId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/houses/${houseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHouses(prev => prev.filter(h => h.id !== houseId));
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete house:', err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
        );
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user account "${name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchStats();
      } else {
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div className="admin-layout">
      {/* Admin Navbar */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand-group">
            <Link to="/" className="brand" aria-label="KejaKU Home">
              <div className="brand-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div className="brand-text">Keja</div>
            </Link>
            <span className="admin-badge">Super Admin</span>
          </div>

          <div className="admin-user-nav">
            <span className="admin-current-user">
              <ShieldCheck size={18} color="var(--primary)" />
              {user?.name || 'Administrator'}
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="admin-logout-btn"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Subheader */}
      <nav className="admin-tabs-bar">
        <div className="admin-tabs-container">
          <button
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Building2 size={16} /> Overview & Analytics
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'houses' ? 'active' : ''}`}
            onClick={() => setActiveTab('houses')}
          >
            <Home size={16} /> Listings Moderation ({stats?.totalHouses || 0})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} /> Accounts & Roles ({stats?.totalUsers || 0})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'enquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('enquiries')}
          >
            <MessageSquare size={16} /> Enquiries Log ({stats?.totalEnquiries || 0})
          </button>
        </div>
      </nav>

      <main className="admin-main">
        {/* KPI Stats Grid */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon emerald">
              <Home size={24} />
            </div>
            <div>
              <div className="admin-stat-value">{stats?.totalHouses ?? '...'}</div>
              <div className="admin-stat-label">Total Listings</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon accent">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="admin-stat-value">{stats?.verifiedHouses ?? '...'}</div>
              <div className="admin-stat-label">Verified Listings</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon blue">
              <Users size={24} />
            </div>
            <div>
              <div className="admin-stat-value">{stats?.totalUsers ?? '...'}</div>
              <div className="admin-stat-label">Total Registered Users</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon amber">
              <MessageSquare size={24} />
            </div>
            <div>
              <div className="admin-stat-value">{stats?.totalEnquiries ?? '...'}</div>
              <div className="admin-stat-label">Total Student Enquiries</div>
            </div>
          </div>
        </section>

        {/* Tab 1: Overview & Houses */}
        {(activeTab === 'overview' || activeTab === 'houses') && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">House Listings Directory</h2>
                <p className="admin-card-subtitle">Inspect, verify, or remove property listings across KM & Wendani</p>
              </div>

              <div className="admin-filter-bar">
                <input
                  type="text"
                  placeholder="Search title, area, type..."
                  className="admin-search-input"
                  value={houseSearch}
                  onChange={(e) => setHouseSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchHouses()}
                />
                <select
                  className="admin-select"
                  value={houseFilter}
                  onChange={(e) => {
                    setHouseFilter(e.target.value);
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="visited">Unverified / Visited</option>
                </select>
                <button className="admin-action-btn verify" onClick={fetchHouses}>
                  <RefreshCw size={14} /> Filter
                </button>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Area & Landmark</th>
                    <th>Type</th>
                    <th>Rent (KSh)</th>
                    <th>Landlord</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {houses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="admin-empty-state">
                        {housesLoading ? 'Loading houses...' : 'No listings found matching criteria.'}
                      </td>
                    </tr>
                  ) : (
                    houses.map((house) => (
                      <tr key={house.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={house.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&q=80'}
                              alt={house.title}
                              style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                            />
                            <div>
                              <strong>{house.title}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID #{house.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{house.area}</div>
                          {house.landmark && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{house.landmark}</div>}
                        </td>
                        <td>{house.type}</td>
                        <td><strong>KSh {Number(house.rent).toLocaleString()}</strong></td>
                        <td>
                          <div>{house.accounts?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{house.accounts?.phone || house.phone || 'No phone'}</div>
                        </td>
                        <td>
                          <span className={`admin-status-badge ${house.status === 'verified' ? 'verified' : 'visited'}`}>
                            {house.status === 'verified' ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleToggleVerify(house.id, house.status)}
                              className={`admin-action-btn ${house.status === 'verified' ? 'unverify' : 'verify'}`}
                              title={house.status === 'verified' ? 'Mark unverified' : 'Approve & Verify'}
                            >
                              {house.status === 'verified' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                              {house.status === 'verified' ? 'Unverify' : 'Verify'}
                            </button>
                            <button
                              onClick={() => handleDeleteHouse(house.id, house.title)}
                              className="admin-action-btn delete"
                              title="Delete listing"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {(activeTab === 'overview' || activeTab === 'users') && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">User Accounts & Roles</h2>
                <p className="admin-card-subtitle">Manage platform permissions, students, owners, and super admins</p>
              </div>

              <div className="admin-filter-bar">
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  className="admin-search-input"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                />
                <select
                  className="admin-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="owner">Landlords / Owners</option>
                  <option value="super_admin">Super Admins</option>
                </select>
                <button className="admin-action-btn verify" onClick={fetchUsers}>
                  <RefreshCw size={14} /> Filter
                </button>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="admin-empty-state">
                        {usersLoading ? 'Loading users...' : 'No users found matching search criteria.'}
                      </td>
                    </tr>
                  ) : (
                    users.map((acc) => (
                      <tr key={acc.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.85rem'
                              }}
                            >
                              {acc.name ? acc.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <strong>{acc.name}</strong>
                              {acc.id === user?.id && (
                                <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>(You)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{acc.email}</td>
                        <td>{acc.phone || <span style={{ color: 'var(--text-muted)' }}>Not provided</span>}</td>
                        <td>
                          <select
                            className="admin-select"
                            value={acc.role}
                            disabled={acc.id === user?.id}
                            onChange={(e) => handleChangeRole(acc.id, e.target.value)}
                            style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                          >
                            <option value="student">student</option>
                            <option value="owner">owner</option>
                            <option value="super_admin">super_admin</option>
                          </select>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {acc.created_at ? new Date(acc.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {acc.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(acc.id, acc.name)}
                                className="admin-action-btn delete"
                                title="Delete user"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Enquiries Audit */}
        {activeTab === 'enquiries' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Student Inquiries Log</h2>
                <p className="admin-card-subtitle">Real-time enquiries sent to landlords</p>
              </div>
              <button className="admin-action-btn verify" onClick={fetchEnquiries}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Phone</th>
                    <th>House Title</th>
                    <th>Viewing Date</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="admin-empty-state">
                        {enquiriesLoading ? 'Loading inquiries...' : 'No enquiries logged.'}
                      </td>
                    </tr>
                  ) : (
                    enquiries.map((enq) => (
                      <tr key={enq.id}>
                        <td><strong>{enq.student_name}</strong></td>
                        <td>{enq.student_phone}</td>
                        <td>{enq.house_title || `House #${enq.house_id}`}</td>
                        <td>{enq.viewing_date || 'N/A'}</td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {enq.message}
                        </td>
                        <td>
                          <span className="admin-status-badge visited">{enq.status || 'open'}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {enq.created_at ? new Date(enq.created_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

