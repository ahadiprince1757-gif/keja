import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import PhonePromptModal from '../components/PhonePromptModal';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [searchParams] = useSearchParams();

  const roleParam = searchParams.get('role');
  const from = location.state?.from?.pathname || (roleParam === 'student' ? '/' : '/dashboard');

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  const getTargetUrl = (user) => {
    if (user?.role === 'super_admin') return '/admin';
    if (from && from !== '/dashboard') return from;
    return user?.role === 'owner' ? '/dashboard' : '/';
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate(getTargetUrl(data.user), { replace: true });
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      setLoading(true);

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          role: roleParam || 'student'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Google login failed. Please try again.');
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      setLoading(false);

      // If user does not have a phone number yet, show the clean phone prompt modal
      if (!data.user.phone || !data.user.phone.trim()) {
        setPendingGoogleUser(data.user);
      } else {
        navigate(getTargetUrl(data.user), { replace: true });
      }
    } catch {
      setError('Network error with Google Sign-In.');
      setLoading(false);
    }
  };

  const handlePhoneModalComplete = (updatedUser) => {
    setPendingGoogleUser(null);
    navigate(getTargetUrl(updatedUser), { replace: true });
  };

  return (
    <div className="auth-page">
      {pendingGoogleUser && (
        <PhonePromptModal
          user={pendingGoogleUser}
          onComplete={handlePhoneModalComplete}
        />
      )}

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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="auth-logo-text">KejaKU</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          {roleParam === 'owner' ? 'Log in to manage your listings' : 'Log in to your account'}
        </p>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Login */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', width: '100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign in failed or was cancelled.')}
            useOneTap={false}
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
            text="signin_with"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0 1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle, #e2ebe4)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.8rem', color: 'var(--text-muted, #74897d)', textTransform: 'uppercase' }}>Or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle, #e2ebe4)' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@student.ku.ac.ke"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <input
              id="login-password"
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link
            to={roleParam ? `/register?role=${roleParam}` : '/register'}
            className="auth-link"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
