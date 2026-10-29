import React, { useState, useEffect } from 'react';

function formatMoney(amount) {
  return 'KSh ' + Number(amount || 0).toLocaleString('en-KE');
}

export default function HouseDetailsModal({
  house,
  onClose,
  onOpenEnquiry
}) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!house) return null;

  const images = (Array.isArray(house.images) && house.images.length > 0)
    ? house.images
    : (house.image ? [house.image] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80']);

  const totalMoveIn = (house.rent || 0) + (house.deposit || 0) + (house.garbageFee || 150);

  return (
    <div className="modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <h2>Property Details & Gallery</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Interactive Photo Gallery Carousel */}
          <div className="product-gallery">
            <div className="gallery-main-view">
              <img
                id="galleryMainImg"
                src={images[currentImgIdx]}
                alt={house.title}
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-nav-arrow arrow-left"
                    onClick={() => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="gallery-nav-arrow arrow-right"
                    onClick={() => setCurrentImgIdx((prev) => (prev + 1) % images.length)}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="gallery-counter-badge" id="galleryCounterBadge">
                {currentImgIdx + 1} / {images.length}
              </div>
            </div>

            {images.length > 1 && (
              <div className="gallery-thumbnails-strip">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`gallery-thumb-btn ${idx === currentImgIdx ? 'active' : ''}`}
                    onClick={() => setCurrentImgIdx(idx)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Header & Price Summary */}
          <div className="detail-header-row">
            <div>
              <h3 className="detail-title">{house.title}</h3>
              <p className="detail-location-sub">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <strong>{house.area}</strong> · {house.landmark || ''}
              </p>
            </div>
            <div className="detail-price-box">
              <div className="detail-price-val">{formatMoney(house.rent)}<small>/mo</small></div>
              <span className="detail-vacancy-pill">
                {house.vacantUnits ? `${house.vacantUnits} Rooms Vacant` : 'Available'}
              </span>
            </div>
          </div>

          {/* Verified Badge Alert */}
          <div className="verified-trust-card">
            <div className="trust-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <strong>Keja Verified Listing</strong>
              <p>Physical inspection confirmed active vacancy, working lock & key, high tap pressure, and registered caretaker.</p>
            </div>
          </div>

          {/* Quick Spec Chips */}
          <div className="detail-quick-specs">
            <div className="spec-cell">
              <span className="spec-label">Room Type</span>
              <span className="spec-val">{house.type}</span>
            </div>
            <div className="spec-cell">
              <span className="spec-label">Floor</span>
              <span className="spec-val">{house.floor || '1st Floor'}</span>
            </div>
            <div className="spec-cell">
              <span className="spec-label">Commute to Campus</span>
              <span className="spec-val">{house.distance}</span>
            </div>
            <div className="spec-cell">
              <span className="spec-label">Gate Access</span>
              <span className="spec-val">{house.gateCurfew || 'Resident Key'}</span>
            </div>
          </div>

          {/* Property Description */}
          <div className="detail-section">
            <h4 className="section-subheading">About the Residence</h4>
            <p className="detail-description-text">{house.description}</p>
          </div>

          {/* Key Amenities Checklist */}
          {Array.isArray(house.features) && house.features.length > 0 && (
            <div className="detail-section">
              <h4 className="section-subheading">Features & Amenities</h4>
              <div className="modal-features-grid">
                {house.features.map((f, i) => (
                  <div key={i} className="modal-feature-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Move-in Cost Breakdown */}
          <div className="detail-section">
            <h4 className="section-subheading">Move-in Cost Breakdown</h4>
            <table className="modal-breakdown-table">
              <tbody>
                <tr>
                  <td>1st Month Rent</td>
                  <td>{formatMoney(house.rent)}</td>
                </tr>
                <tr>
                  <td>Refundable Security Deposit</td>
                  <td>{formatMoney(house.deposit)}</td>
                </tr>
                <tr>
                  <td>Monthly Garbage Collection</td>
                  <td>{formatMoney(house.garbageFee || 150)}</td>
                </tr>
                <tr>
                  <td>Water Supply Details</td>
                  <td style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>{house.water}</td>
                </tr>
                <tr>
                  <td>Electricity / Tokens</td>
                  <td style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>{house.electricity}</td>
                </tr>
                <tr>
                  <td>Internet / Wi-Fi</td>
                  <td style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>{house.wifi || 'Available'}</td>
                </tr>
                <tr className="table-total-row">
                  <td>Estimated Initial Move-In Total</td>
                  <td style={{ color: 'var(--primary)', fontSize: '1.15rem', fontWeight: '800' }}>
                    {formatMoney(totalMoveIn)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* House Rules */}
          {Array.isArray(house.rules) && house.rules.length > 0 && (
            <div className="detail-section">
              <h4 className="section-subheading">Building Regulations</h4>
              <ul className="detail-rules-list">
                {house.rules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Caretaker Contact & Action Buttons */}
          <div className="caretaker-card">
            <div className="caretaker-info">
              <div className="caretaker-avatar">
                {(house.caretaker || 'C')[0]}
              </div>
              <div>
                <div className="caretaker-name">{house.caretaker || 'Resident Caretaker'}</div>
                <div className="caretaker-role">Authorized Property Manager · Typically replies in &lt; 15 mins</div>
              </div>
            </div>

            <div className="caretaker-actions-grid" style={{ gridTemplateColumns: '1fr' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  onClose();
                  onOpenEnquiry(house);
                }}
              >
                Talk to Caretaker
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
