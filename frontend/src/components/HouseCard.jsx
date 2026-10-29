import React from 'react';

function formatMoney(amount) {
  return 'KSh ' + Number(amount || 0).toLocaleString('en-KE');
}

export default function HouseCard({
  house,
  isSaved,
  onToggleSave,
  onViewDetails,
  onEnquire
}) {
  const isVisited = house.status === 'visited' || house.status === 'verified';
  const images = (Array.isArray(house.images) && house.images.length > 0)
    ? house.images
    : (house.image ? [house.image] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80']);

  const coverImage = images[0];
  const photoCount = images.length;

  return (
    <article className="house-card" data-id={house.id}>
      <div className="card-media">
        <img
          src={coverImage}
          alt={house.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        <div className="card-badge-top-left">
          {isVisited ? (
            <span className="badge badge-verified">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>{' '}
              Verified Property
            </span>
          ) : (
            <span className="badge badge-featured">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>{' '}
              Student Favorite
            </span>
          )}
        </div>

        <div className="card-badge-bottom-left">
          <span className="card-photo-count">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>{' '}
            {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
          </span>
        </div>

        <button
          type="button"
          className={`card-save-btn ${isSaved ? 'is-saved' : ''}`}
          onClick={() => onToggleSave(house)}
          title={isSaved ? 'Remove from saved' : 'Save house'}
          aria-label={`Save ${house.title}`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div className="card-body">
        <div className="card-price-row">
          <div className="card-price">
            {formatMoney(house.rent)}<small>/month</small>
          </div>
          <span className="card-deposit-tag">Deposit: {formatMoney(house.deposit)}</span>
        </div>

        <h3 className="card-title">{house.title}</h3>

        <div className="card-location">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{house.area} · {house.distance}</span>
        </div>

        <div className="card-spec-tags">
          <span className="spec-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>{' '}
            {house.type}
          </span>
          <span className="spec-pill">{house.floor || '1st Floor'}</span>
          <span className="spec-pill vacant-pill">
            {house.vacantUnits ? `${house.vacantUnits} Vacant` : 'Available'}
          </span>
        </div>

        <div className="card-amenities">
          {(house.features || []).slice(0, 4).map((feat, idx) => (
            <span key={idx} className="amenity-chip">{feat}</span>
          ))}
        </div>

        <div className="card-meta-notes">
          <div><strong>Water:</strong> {house.water}</div>
          <div><strong>Tokens:</strong> {house.electricity}</div>
        </div>

        <div className="card-actions">
          <button
            type="button"
            className="btn btn-view-details"
            onClick={() => onViewDetails(house)}
          >
            View Details ({photoCount})
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onEnquire(house)}
          >
            Book Viewing
          </button>
        </div>
      </div>
    </article>
  );
}
