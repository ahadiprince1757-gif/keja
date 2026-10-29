import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, authFetch, login, token } = useAuth();
  const [form, setForm]   = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const res  = await authFetch('/api/accounts/me/profile', { method: 'PUT', body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || 'Update failed.'); return; }
      // Refresh user in context
      login(token, data.user);
      setSuccess('Profile updated successfully!');
    } catch { setError('Network error.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 className="section-title" style={{ marginBottom: 24 }}>My Profile</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32,
        padding: 24, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--primary-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '1.8rem', fontWeight: 800,
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{user?.name}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{user?.email}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
            Owner since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }) : '—'}
          </div>
        </div>
      </div>

      {success && <div style={{ padding: '12px 16px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)', marginBottom: 16, fontWeight: 600 }}>✓ {success}</div>}
      {error   && <div className="auth-error-banner" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18,
        background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="form-group">
          <label htmlFor="profile-name">Full Name</label>
          <input id="profile-name" name="name" className="form-input" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="profile-email">Email Address</label>
          <input id="profile-email" type="email" className="form-input" value={user?.email || ''} disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
        <div className="form-group">
          <label htmlFor="profile-phone">Phone Number</label>
          <input id="profile-phone" name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+254712345678" />
        </div>
        <button type="submit" className="btn btn-primary" id="btn-save-profile" disabled={saving}>
          {saving ? 'Saving…' : '✓ Save Changes'}
        </button>
      </form>
    </div>
  );
}
