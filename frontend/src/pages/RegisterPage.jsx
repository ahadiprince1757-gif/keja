import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'student';
  const [role, setRole] = useState(initialRole); // 'student' or 'owner'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim())  return 'Name is required.';
    if (!form.email.trim()) return 'Email address is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErr = validate();
    if (validationErr) { setError(validationErr); return; }

    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      // If student, go back to home page to browse & save houses; if owner, go to dashboard
      navigate(data.user.role === 'owner' ? '/dashboard' : '/', { replace: true });
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to KejaKU
      </Link>

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="auth-logo-text">KejaKU</div>
        </Link>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">
          {role === 'student' ? 'Save houses, book visits, and chat with caretakers.' : 'List your properties and manage tenants.'}
        </p>

        {/* Minimal Role Selector */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '20px',
          gap: '4px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => setRole('student')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: role === 'student' ? 'var(--color-primary, #6366f1)' : 'transparent',
              color: role === 'student' ? '#fff' : '#9ca3af',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            🎓 Student / Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: role === 'owner' ? 'var(--color-primary, #6366f1)' : 'transparent',
              color: role === 'owner' ? '#fff' : '#9ca3af',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            🏠 Caretaker / Owner
          </button>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name" name="name" type="text"
              className="form-input"
              placeholder="e.g. John Kamau"
              value={form.name} onChange={handleChange} required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email" name="email" type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange} required autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-phone">Phone (optional)</label>
              <input
                id="reg-phone" name="phone" type="tel"
                className="form-input"
                placeholder="0712 345 678"
                value={form.phone} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password" name="password" type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} required autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm" name="confirm" type="password"
                className="form-input"
                placeholder="Repeat password"
                value={form.confirm} onChange={handleChange} required autoComplete="new-password"
              />
            </div>
          </div>

          <button
            id="btn-register-submit"
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <p className="auth-switch">
          Already have an account?{' '}
          <Link to={`/login?role=${role}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
