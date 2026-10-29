import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit3, AlertCircle, X } from 'lucide-react';

const AREAS = ['Near KU main gate', 'Kahawa Wendani', 'Kahawa Sukari', 'Ruiru'];
const TYPES = ['Bedsitter', 'Single room', '1 bedroom', '2 bedroom'];

export default function HouseEditModal({ house, onClose, onUpdated }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState({
    title:       house.title || '',
    area:        house.area  || AREAS[0],
    type:        house.type  || TYPES[0],
    rent:        house.rent  || '',
    deposit:     house.deposit || '',
    landmark:    house.landmark || '',
    vacantUnits: house.vacantUnits || 1,
    description: house.description || '',
    water:       house.water || '',
    electricity: house.electricity || '',
    wifi:        house.wifi || '',
    phone:       house.phone || '',
    whatsapp:    house.whatsapp || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res  = await authFetch(`/api/accounts/me/houses/${house.id}`, {
        method: 'PUT',
        body:   JSON.stringify({
          ...form,
          rent:        Number(form.rent),
          deposit:     Number(form.deposit),
          vacantUnits: Number(form.vacantUnits),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update listing.');
        setLoading(false);
        return;
      }
      onUpdated(data.data);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="edit-modal-title" className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={18} color="var(--primary)" /> Edit Listing
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert" style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label htmlFor="edit-title">Listing Title</label>
            <input id="edit-title" name="title" className="form-input" value={form.title} onChange={handleChange} required placeholder="e.g. Modern Bedsitter near KU Gate" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-area">Area</label>
              <select id="edit-area" name="area" className="form-input" value={form.area} onChange={handleChange}>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-type">Room Type</label>
              <select id="edit-type" name="type" className="form-input" value={form.type} onChange={handleChange}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-rent">Monthly Rent (KES)</label>
              <input id="edit-rent" name="rent" type="number" min="500" className="form-input" value={form.rent} onChange={handleChange} required placeholder="e.g. 5500" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-deposit">Deposit (KES)</label>
              <input id="edit-deposit" name="deposit" type="number" min="0" className="form-input" value={form.deposit} onChange={handleChange} placeholder="e.g. 5500" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-landmark">Landmark</label>
              <input id="edit-landmark" name="landmark" className="form-input" value={form.landmark} onChange={handleChange} placeholder="e.g. Near Transformer KM" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-units">Vacant Units</label>
              <input id="edit-units" name="vacantUnits" type="number" min="0" className="form-input" value={form.vacantUnits} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea id="edit-description" name="description" className="form-input" rows={3} value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} placeholder="Describe the property…" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-phone">Phone</label>
              <input id="edit-phone" name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+254712345678" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-whatsapp">WhatsApp</label>
              <input id="edit-whatsapp" name="whatsapp" className="form-input" value={form.whatsapp} onChange={handleChange} placeholder="+254712345678" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading} id="btn-save-edit">
              {loading ? 'Saving…' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
