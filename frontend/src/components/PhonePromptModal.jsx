import React, { useState } from 'react';
import { Phone, ArrowRight, Sparkles } from 'lucide-react';

export default function PhonePromptModal({ user, onComplete }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim();

    // Kenyan phone validation (07..., 01..., +254...)
    const phoneRegex = /^(?:(?:\+254)|0)?(7|1)\d{8}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone.replace(/\s+/g, ''))) {
      setError('Please enter a valid Kenyan phone number (e.g. 0712 345 678).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/accounts/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('kejaku_auth_token')}`,
        },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update phone number.');
        setLoading(false);
        return;
      }

      const updatedUser = { ...user, phone: cleanPhone };
      onComplete(updatedUser);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '32px 28px',
        maxWidth: '420px',
        width: '100%',
        color: '#111827',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center',
      }}>
        {/* Top Icon Badge */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#ecfdf5',
          color: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 0 0 8px #f0fdf4',
        }}>
          <Phone size={26} strokeWidth={2.2} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '6px'
        }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Almost done, {displayName}!
          </h2>
          <Sparkles size={20} color="#16a34a" />
        </div>

        <p style={{ fontSize: '0.92rem', color: '#6b7280', marginBottom: '24px', lineHeight: 1.5 }}>
          Add your phone number so {user?.role === 'owner' ? 'students can contact you for viewings' : 'caretakers can respond to your enquiries'}.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.86rem',
            marginBottom: '16px',
            textAlign: 'left',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '22px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: '#374151',
              marginBottom: '8px',
              fontWeight: 600,
            }}>
              Phone Number (WhatsApp)
            </label>
            <input
              type="tel"
              placeholder="0712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '13px 15px',
                borderRadius: '10px',
                border: '1.5px solid #d1d5db',
                backgroundColor: '#f9fafb',
                color: '#111827',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#16a34a';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.backgroundColor = '#f9fafb';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 16px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              transition: 'background-color 0.2s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#15803d';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#16a34a';
            }}
          >
            {loading ? 'Saving...' : <>Continue to Keja <ArrowRight size={18} strokeWidth={2.2} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
