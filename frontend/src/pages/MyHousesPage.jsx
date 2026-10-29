import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HouseEditModal from '../components/HouseEditModal';
import ListHouseModal from '../components/ListHouseModal';
import { Building, Edit3, Trash2, Plus, Check } from 'lucide-react';

export default function MyHousesPage() {
  const { authFetch } = useAuth();
  const [houses, setHouses]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast]           = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchHouses = () => {
    setLoading(true);
    authFetch('/api/accounts/me/houses')
      .then(r => r.json())
      .then(data => { if (data.success) setHouses(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchHouses, []);

  const handleDelete = async (house) => {
    if (!window.confirm(`Delete "${house.title}"? This cannot be undone.`)) return;
    setDeletingId(house.id);
    try {
      const res = await authFetch(`/api/accounts/me/houses/${house.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHouses(prev => prev.filter(h => h.id !== house.id));
        showToast('Listing deleted.');
      }
    } catch { /* ignore */ }
    finally { setDeletingId(null); }
  };

  const handleUpdated = (updated) => {
    setHouses(prev => prev.map(h => h.id === updated.id ? updated : h));
    setEditTarget(null);
    showToast('Listing updated successfully!');
  };

  const handleAdded = (newHouse) => {
    setHouses(prev => [newHouse, ...prev]);
    setShowAdd(false);
    showToast('New listing published!');
  };

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'var(--primary)', color: 'white',
          padding: '12px 20px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)', fontWeight: 600, fontSize: '0.9rem',
          animation: 'fadeInUp 0.3s ease',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Check size={18} strokeWidth={2.5} /> {toast}
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">My Listings ({houses.length})</h2>
        <button
          type="button"
          className="btn btn-primary"
          id="btn-add-listing"
          onClick={() => setShowAdd(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} strokeWidth={2.5} /> Add New Listing
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your listings…
        </div>
      ) : houses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <Building size={48} strokeWidth={1.5} color="var(--primary)" />
          </div>
          <h3>No listings yet</h3>
          <p>You haven't listed any properties. Add your first one!</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAdd(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} strokeWidth={2.5} /> Add Your First Listing
          </button>
        </div>
      ) : (
        <div className="owner-houses-grid">
          {houses.map(house => (
            <div key={house.id} className="owner-house-card">
              <img
                className="owner-house-img"
                src={(house.images?.[0] || house.image) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'}
                alt={house.title}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'; }}
              />
              <div className="owner-house-body">
                <h3 className="owner-house-title">{house.title}</h3>
                <p className="owner-house-meta">
                  {house.area} · {house.type} · KES {house.rent?.toLocaleString()}/mo
                  {house.vacantUnits !== undefined && ` · ${house.vacantUnits} unit${house.vacantUnits !== 1 ? 's' : ''} vacant`}
                </p>
                <div className="owner-house-actions">
                  <button
                    type="button"
                    className="btn-edit"
                    id={`btn-edit-${house.id}`}
                    onClick={() => setEditTarget(house)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit3 size={15} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    id={`btn-delete-${house.id}`}
                    disabled={deletingId === house.id}
                    onClick={() => handleDelete(house)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {deletingId === house.id ? '…' : (
                      <>
                        <Trash2 size={15} /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && (
        <HouseEditModal
          house={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={handleUpdated}
        />
      )}

      {showAdd && (
        <ListHouseModal
          onClose={() => setShowAdd(false)}
          onHouseCreated={handleAdded}
          ownerId={null /* set via authFetch in accounts route */}
        />
      )}
    </div>
  );
}
