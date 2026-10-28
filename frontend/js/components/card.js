/**
 * House Card Component
 * Renders individual house listing card HTML
 */

import { isSaved } from './saved.js';

export function formatMoney(amount) {
  return 'KSh ' + Number(amount || 0).toLocaleString('en-KE');
}

export function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

export function createHouseCard(house) {
  const saved = isSaved(house.id);
  const isVisited = house.status === 'visited';

  const badgeHtml = isVisited
    ? `<span class="badge badge-verified"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Physical Visit Verified</span>`
    : `<span class="badge badge-unverified"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Student Submitted</span>`;

  const amenitiesHtml = (house.features || [])
    .slice(0, 3)
    .map(feat => `<span class="amenity-chip">${escapeHtml(feat)}</span>`)
    .join('');

  return `
    <article class="house-card" data-id="${house.id}">
      <div class="card-media">
        <img
          src="${escapeHtml(house.image)}"
          alt="${escapeHtml(house.title)}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'"
        />

        <div class="card-badge-top-left">
          ${badgeHtml}
        </div>

        <button
          type="button"
          class="card-save-btn ${saved ? 'is-saved' : ''}"
          data-action="toggle-save"
          data-id="${house.id}"
          title="${saved ? 'Remove from saved' : 'Save house'}"
          aria-label="Save ${escapeHtml(house.title)}"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div class="card-body">
        <div class="card-price-row">
          <div class="card-price">
            ${formatMoney(house.rent)}<small>/month</small>
          </div>
          <span class="card-deposit-tag">Deposit: ${formatMoney(house.deposit)}</span>
        </div>

        <h3 class="card-title">${escapeHtml(house.title)}</h3>

        <div class="card-location">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${escapeHtml(house.area)} · ${escapeHtml(house.distance)}</span>
        </div>

        <div class="card-amenities">
          <span class="amenity-chip" style="background:var(--primary-light);color:var(--primary);">${escapeHtml(house.type)}</span>
          ${amenitiesHtml}
        </div>

        <div class="card-meta-notes">
          <div><strong>Water:</strong> ${escapeHtml(house.water)}</div>
          <div><strong>Electricity:</strong> ${escapeHtml(house.electricity)}</div>
        </div>

        <div class="card-actions">
          <button type="button" class="btn" data-action="details" data-id="${house.id}">
            View Details
          </button>
          <button type="button" class="btn btn-primary" data-action="enquire" data-id="${house.id}">
            Enquire Now
          </button>
        </div>
      </div>
    </article>
  `;
}
