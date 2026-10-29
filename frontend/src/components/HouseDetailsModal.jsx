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

  const whatsappPhone = (house.whatsapp || house.phone || '254712345678').replace(/[^0-9]/g, '');
  const whatsappMsg = `Hello ${house.caretaker || 'Caretaker'}, I found your listing "${house.title}" on Keja (${formatMoney(house.rent)}/mo). Is it vacant? I would like to schedule a physical viewing.`;
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container detail-modal-container">
        {/* Header Bar */}
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-type-badge">{house.type}</span>
            <span className="modal-header-area">{house.area}</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="modal-body detail-modal-body">
          {/* Photo Gallery Carousel */}
          <div className="product-gallery">
            <div className="gallery-main-view">
              <img
                src={images[currentImgIdx]}
                alt={house.title}
                loading="eager"
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

              <div className="gallery-counter-badge">
                📷 {currentImgIdx + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
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

          {/* Pricing & Key Meta Bar */}
          <div className="detail-hero-box">
            <div className="detail-price-line">
              <div className="detail-price-main">
                {formatMoney(house.rent)}
                <span className="detail-price-period"> / month</span>
              </div>
              <span className="detail-vacant-badge">
                ✓ {house.vacantUnits ? `${house.vacantUnits} Unit${house.vacantUnits > 1 ? 's' : ''} Vacant` : 'Available'}
              </span>
            </div>

            <h3 className="detail-hero-title">{house.title}</h3>

            <div className="detail-location-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="location-main-text"><strong>{house.area}</strong></span>
              {house.landmark && <span className="location-landmark">· {house.landmark}</span>}
            </div>
          </div>

          {/* Trust Verification Card */}
          <div className="verified-trust-card">
            <div className="trust-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="trust-body">
              <div className="trust-title">Keja Verified Listing</div>
              <div className="trust-subtitle">
                Physical check confirmed active vacancy, working lock & key, and high water pressure.
              </div>
            </div>
          </div>

          {/* Clean Quick Specs Grid */}
          <div className="detail-specs-grid">
            <div className="spec-card">
              <div className="spec-icon-wrap">🏠</div>
              <div className="spec-content">
                <span className="spec-name">Room Type</span>
                <span className="spec-value">{house.type}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon-wrap">🏢</div>
              <div className="spec-content">
                <span className="spec-name">Floor Level</span>
                <span className="spec-value">{house.floor || '1st Floor'}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon-wrap">🚶</div>
              <div className="spec-content">
                <span className="spec-name">Campus Distance</span>
                <span className="spec-value">{house.distance}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon-wrap">🔑</div>
              <div className="spec-content">
                <span className="spec-name">Gate Access</span>
                <span className="spec-value">{house.gateCurfew || 'Resident Key'}</span>
              </div>
            </div>
          </div>

          {/* Features & Amenities (Modern Tag Chips) */}
          <div className="detail-section">
            <h4 className="detail-section-title">Amenities & Highlights</h4>
            <div className="detail-chips-wrap">
              {(house.features || [
                'Borehole Water', 'Token Meter', 'Tiled Floor', 'Instant Hot Shower'
              ]).map((f, i) => (
                <div key={i} className="amenity-badge-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="detail-section">
            <h4 className="detail-section-title">About the Residence</h4>
            <p className="detail-description-para">{house.description}</p>
          </div>

          {/* Move-in Cost Breakdown */}
          <div className="detail-section">
            <h4 className="detail-section-title">Move-in Cost Breakdown</h4>
            <div className="cost-breakdown-card">
              <div className="cost-row">
                <span>1st Month Rent</span>
                <strong>{formatMoney(house.rent)}</strong>
              </div>
              <div className="cost-row">
                <span>Refundable Deposit</span>
                <strong>{formatMoney(house.deposit)}</strong>
              </div>
              <div className="cost-row">
                <span>Monthly Garbage Collection</span>
                <strong>{formatMoney(house.garbageFee || 150)}</strong>
              </div>
              <div className="cost-row cost-utility-row">
                <span>Water Supply</span>
                <span className="cost-sub-val">{house.water}</span>
              </div>
              <div className="cost-row cost-utility-row">
                <span>Electricity</span>
                <span className="cost-sub-val">{house.electricity}</span>
              </div>
              <div className="cost-row cost-utility-row">
                <span>Internet / Wi-Fi</span>
                <span className="cost-sub-val">{house.wifi || 'Available'}</span>
              </div>
              <div className="cost-row cost-total-row">
                <span>Estimated Move-In Total</span>
                <span className="cost-total-amount">{formatMoney(totalMoveIn)}</span>
              </div>
            </div>
          </div>

          {/* House Rules */}
          {house.rules && house.rules.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title">Building Regulations</h4>
              <ul className="detail-rules-list">
                {house.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Caretaker Info Card */}
          <div className="caretaker-banner">
            <div className="caretaker-avatar">
              {(house.caretaker || 'C')[0]}
            </div>
            <div className="caretaker-meta">
              <div className="caretaker-name">{house.caretaker || 'Resident Caretaker'}</div>
              <div className="caretaker-desc">Authorized Property Manager · Replies fast</div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="modal-sticky-footer">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn modal-whatsapp-btn"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.302c-.087.087-.178.181-.077.355.101.174.449.741.964 1.2.662.591 1.22.774 1.393.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/>
            </svg>
            WhatsApp
          </a>

          <button
            type="button"
            className="btn btn-primary modal-book-btn"
            onClick={() => {
              onClose();
              onOpenEnquiry(house);
            }}
          >
            Schedule Viewing
          </button>
        </div>
      </div>
    </div>
  );
}
