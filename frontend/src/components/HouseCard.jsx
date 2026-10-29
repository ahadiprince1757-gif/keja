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
    <article className="house-card compact-card" data-id={house.id}>
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
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Verified
            </span>
          ) : (
            <span className="badge badge-featured">Featured</span>
          )}
        </div>

        <div className="card-badge-bottom-left">
          <span className="card-photo-count">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            {photoCount}
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
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div className="card-body">
        {/* Price */}
        <div className="card-price-row">
          <div className="card-price">
            {formatMoney(house.rent)}<small>/mo</small>
          </div>
        </div>

        {/* Size of the house */}
        <div className="card-size-row">
          <span className="card-size-badge" title={`House Size: ${house.type}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <span className="truncate">{house.type}</span>
          </span>
        </div>

        {/* Location of the house */}
        <div className="card-location" title={house.area}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="truncate">{house.area}</span>
        </div>

        {/* Retained Actions */}
        <div className="card-actions">
          <button
            type="button"
            className="btn btn-view-details"
            onClick={() => onViewDetails(house)}
          >
            View Details
          </button>
          <button
            type="button"
            className="btn btn-primary btn-book-viewing"
            onClick={() => onEnquire(house)}
          >
            Book Viewing
          </button>
        </div>
      </div>
    </article>
  );
}
