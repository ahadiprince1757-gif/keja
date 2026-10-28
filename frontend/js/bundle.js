/**
 * Standalone Universal Bundle for KejaKU Frontend
 * Integrates with Backend REST API (with offline fallback)
 */

(function () {
  'use strict';

  const API_BASE = window.location.origin.includes('localhost:5000')
    ? '/api'
    : 'http://localhost:5000/api';

  // 1. Initial Dataset (Offline / Fallback Data)
  const defaultHouses = [
    {
      id: 1,
      title: "Bright Modern Single Room",
      area: "Kahawa Wendani",
      landmark: "Behind Magunas Supermarket",
      type: "Single room",
      rent: 3200,
      deposit: 3200,
      garbageFee: 150,
      distance: "9 min walk to KU Nyayo Gate",
      water: "Borehole & City Council (24/7 Supply)",
      electricity: "Prepaid KPLC Token Meter in room",
      status: "visited",
      caretaker: "Mama Kevin (Caretaker)",
      phone: "+254712345678",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      features: ["Borehole Water", "Prepaid Tokens", "Tiled Floor", "Perimeter Wall & Gate"],
      description: "Well-lit and quiet single room suitable for serious students. Tiled floor, ceiling fan, secure steel door, and constant borehole water supply. 2 minutes to matatu stage at Wendani."
    },
    {
      id: 2,
      title: "Executive Studio Bedsitter",
      area: "Near KU main gate",
      landmark: "KM Gate Phase 2",
      type: "Bedsitter",
      rent: 6500,
      deposit: 6500,
      garbageFee: 200,
      distance: "4 min walk to KU Main Gate",
      water: "Borehole on-site (Free)",
      electricity: "Prepaid KPLC Tokens",
      status: "visited",
      caretaker: "Mr. Mwangi (Property Manager)",
      phone: "+254722987654",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      features: ["Private Bathroom", "Modern Kitchenette", "Free WiFi", "CCTV Security", "Balcony"],
      description: "Modern executive bedsitter within KM. Granite kitchen counter, private clean hot shower, high-speed fiber internet connection included, biometric access gate."
    },
    {
      id: 3,
      title: "Budget Shared Double Room",
      area: "Kahawa Sukari",
      landmark: "1st South Avenue, near QuickMart",
      type: "Shared room",
      rent: 2800,
      deposit: 2500,
      garbageFee: 100,
      distance: "12 min walk or 5 min matatu to KU",
      water: "City Council + 5000L Reserve Tank",
      electricity: "Split bill (avg KSh 300/mo)",
      status: "unverified",
      caretaker: "John (Student Host)",
      phone: "+254733123456",
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      features: ["Spacious", "WiFi Ready", "Study Desks", "Paved Compound"],
      description: "Affordable shared room in a calm, gated residential court in Kahawa Sukari. Looking for a neat student roommate. Secure compound with 24hr neighborhood watch."
    },
    {
      id: 4,
      title: "Spacious Balcony Bedsitter",
      area: "Kahawa Wendani",
      landmark: "Near Cleanshelf & Shell Station",
      type: "Bedsitter",
      rent: 5800,
      deposit: 5800,
      garbageFee: 150,
      distance: "10 min walk to KU Footbridge",
      water: "Clean Borehole + Overhead Tank",
      electricity: "Individual Token Meter",
      status: "visited",
      caretaker: "Eunice (Care Manager)",
      phone: "+254701234890",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      features: ["Private Balcony", "Private Bathroom", "Prepaid Tokens", "Clothes Hanging Area"],
      description: "Upper floor bedsitter with good natural airflow and sunshine. Private washroom with instant shower head, spacious wardrobe cabinets, and dedicated clothes drying terrace."
    },
    {
      id: 5,
      title: "Pocket-Friendly Single Room",
      area: "Ruiru",
      landmark: "Near Ruiru Bypass interchange",
      type: "Single room",
      rent: 2500,
      deposit: 2500,
      garbageFee: 100,
      distance: "15 min matatu ride to KU (Stage directly outside)",
      water: "Shared tap with heavy reserve tanks",
      electricity: "Fixed KSh 350 flat monthly fee",
      status: "unverified",
      caretaker: "Baba Wanja",
      phone: "+254711998877",
      image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      features: ["Very Cheap", "Outside Verandah", "Large Yard", "Safe Neighborhood"],
      description: "Ideal budget choice for students looking to keep monthly rent minimal. Matatus pass right outside gate into KU campus every 5 minutes."
    },
    {
      id: 6,
      title: "Premier Campus Student Hostel",
      area: "Near KU main gate",
      landmark: "Opposite Nyayo Hostels Gate",
      type: "Hostel",
      rent: 4800,
      deposit: 2000,
      garbageFee: 0,
      distance: "3 min walk to KU Lecture Halls",
      water: "Inclusive (24/7 Hot Water)",
      electricity: "All Utilities Included in Rent",
      status: "visited",
      caretaker: "Warden Office (Front Desk)",
      phone: "+254799001122",
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
      features: ["Bed Provided", "Study Hall", "Full Security", "Free High-Speed WiFi", "Hot Shower"],
      description: "Private vetted student residence. Includes bed frame with clean mattress, personal study desk with socket, backup generator during blackouts, and CCTV on all corridors."
    },
    {
      id: 7,
      title: "Cozy 1-Bedroom Apartment",
      area: "Kahawa Sukari",
      landmark: "Near Balozi Estate Entrance",
      type: "1 Bedroom",
      rent: 8500,
      deposit: 8500,
      garbageFee: 250,
      distance: "10 min direct bike or matatu to KU",
      water: "County + Purified Borehole Water",
      electricity: "Individual Token Meter",
      status: "visited",
      caretaker: "Estate Management",
      phone: "+254728554433",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      features: ["Separate Bedroom", "Large Living Room", "Kitchen Cabinets", "Car Parking"],
      description: "Spacious one bedroom apartment with separate sitting room and kitchen. Perfect for postgraduate students or two friends wishing to split rent in a peaceful estate."
    },
    {
      id: 8,
      title: "Modern Tiled Bedsitter",
      area: "Kahawa Wendani",
      landmark: "Nakumatt Stage / Wendani Road",
      type: "Bedsitter",
      rent: 5200,
      deposit: 5200,
      garbageFee: 150,
      distance: "7 min walk to KU Nyayo Gate",
      water: "24/7 Borehole connected to all rooms",
      electricity: "Own KPLC Meter",
      status: "visited",
      caretaker: "Fred (Caretaker)",
      phone: "+254714443322",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      features: ["Ceramic Tiles", "Instant Hot Shower", "WiFi Cable Ready", "Night Watchman"],
      description: "Very popular building amongst Kenyatta University undergraduates. Clean washroom with instant shower head, night security guard at gate, and easy walk to lecture rooms."
    }
  ];

  // 2. Saved State
  const STORAGE_KEY = 'kejaku_saved_houses_v2';
  let savedSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));

  function isSaved(id) {
    return savedSet.has(Number(id));
  }

  function toggleSaveHouse(id, houseTitle) {
    const numId = Number(id);
    const had = savedSet.has(numId);
    if (had) {
      savedSet.delete(numId);
      showToast(`Removed "${houseTitle}" from saved houses.`);
    } else {
      savedSet.add(numId);
      showToast(`Saved "${houseTitle}" to your list!`);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedSet]));
    updateSavedBadgeCount();
    return !had;
  }

  function updateSavedBadgeCount() {
    const pill = document.getElementById('savedCountPill');
    if (pill) pill.textContent = savedSet.size;
  }

  // 3. Toast Component
  let toastTimer = null;
  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    container.innerHTML = '';
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    const iconSvg = type === 'error'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    toast.innerHTML = `<span class="toast-icon">${iconSvg}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // 4. Utility Functions
  function formatMoney(amount) {
    return 'KSh ' + Number(amount || 0).toLocaleString('en-KE');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }

  // 5. Card Component
  function createHouseCard(house) {
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

  // 6. Filtering Logic
  function filterHouses(houses, filters) {
    const { keyword, area, type, maxRent, minRent, verifiedOnly, savedOnly, sortBy } = filters;
    const searchLower = keyword.trim().toLowerCase();

    let filtered = houses.filter(house => {
      if (searchLower) {
        const matchTitle = house.title.toLowerCase().includes(searchLower);
        const matchArea = house.area.toLowerCase().includes(searchLower);
        const matchLandmark = (house.landmark || '').toLowerCase().includes(searchLower);
        const matchDesc = (house.description || '').toLowerCase().includes(searchLower);
        const matchType = house.type.toLowerCase().includes(searchLower);
        const matchFeatures = (house.features || []).some(f => f.toLowerCase().includes(searchLower));
        if (!matchTitle && !matchArea && !matchLandmark && !matchDesc && !matchType && !matchFeatures) {
          return false;
        }
      }

      if (area && house.area !== area) return false;
      if (type && house.type !== type) return false;
      if (house.rent > maxRent || house.rent < minRent) return false;
      if (verifiedOnly && house.status !== 'visited') return false;
      if (savedOnly && !savedSet.has(house.id)) return false;

      return true;
    });

    if (sortBy === 'low') {
      filtered.sort((a, b) => a.rent - b.rent);
    } else if (sortBy === 'high') {
      filtered.sort((a, b) => b.rent - a.rent);
    } else if (sortBy === 'proximity') {
      const priority = { 'Near KU main gate': 1, 'Kahawa Wendani': 2, 'Kahawa Sukari': 3, 'Ruiru': 4 };
      filtered.sort((a, b) => (priority[a.area] || 99) - (priority[b.area] || 99));
    }

    return filtered;
  }

  // 7. Modal System
  let modalBackdrop = null;
  let modalContainer = null;

  function initModal() {
    modalBackdrop = document.getElementById('modalBackdrop');
    modalContainer = document.getElementById('modalContainer');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop?.classList.contains('open')) {
        closeModal();
      }
    });
  }

  function openModal(headerTitle, bodyHtml) {
    if (!modalBackdrop || !modalContainer) return;
    const header = modalContainer.querySelector('.modal-header h2');
    const body = modalContainer.querySelector('.modal-body');
    if (header) header.textContent = headerTitle;
    if (body) body.innerHTML = bodyHtml;
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showHouseDetails(house) {
    const isVisited = house.status === 'visited';
    const totalMoveIn = (house.rent || 0) + (house.deposit || 0) + (house.garbageFee || 0);

    const html = `
      <div class="modal-gallery-preview">
        <img src="${escapeHtml(house.image)}" alt="${escapeHtml(house.title)}" />
      </div>

      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px;">
        <h3 style="font-size:1.4rem; color:var(--text-main);">${escapeHtml(house.title)}</h3>
        <div style="font-size:1.4rem; font-weight:800; color:var(--primary);">
          ${formatMoney(house.rent)}<small style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">/mo</small>
        </div>
      </div>

      <p style="color:var(--text-secondary); margin-bottom:16px;">
        <strong>Location:</strong> ${escapeHtml(house.area)} · ${escapeHtml(house.landmark || '')} (${escapeHtml(house.distance)})
      </p>

      <div class="notice-banner" style="margin-bottom:20px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <div>
          <strong>${isVisited ? 'Verified Property Visit' : 'Student Submitted Listing'}</strong>
          <p style="margin-top:2px; font-size:0.82rem;">Always physically inspect the house in person with the caretaker before sending any money.</p>
        </div>
      </div>

      <h4 style="margin-bottom:8px; font-size:1rem;">About This Property</h4>
      <p style="color:var(--text-secondary); font-size:0.92rem; line-height:1.6; margin-bottom:20px;">
        ${escapeHtml(house.description)}
      </p>

      <h4 style="margin-bottom:8px; font-size:1rem;">Pricing Breakdown</h4>
      <table class="modal-breakdown-table">
        <tr><td>1st Month Rent</td><td>${formatMoney(house.rent)}</td></tr>
        <tr><td>Refundable Security Deposit</td><td>${formatMoney(house.deposit)}</td></tr>
        <tr><td>Garbage Collection (Monthly)</td><td>${formatMoney(house.garbageFee || 150)}</td></tr>
        <tr><td>Estimated Initial Move-in Total</td><td style="color:var(--primary); font-size:1.05rem;">${formatMoney(totalMoveIn)}</td></tr>
      </table>

      <h4 style="margin-top:20px; margin-bottom:8px; font-size:1rem;">Utility & Facility Details</h4>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; font-size:0.88rem;">
        <div style="background:var(--bg-subtle); padding:10px 14px; border-radius:var(--radius-sm);">
          <strong style="display:block; color:var(--text-secondary); margin-bottom:2px;">Water Supply:</strong>
          ${escapeHtml(house.water)}
        </div>
        <div style="background:var(--bg-subtle); padding:10px 14px; border-radius:var(--radius-sm);">
          <strong style="display:block; color:var(--text-secondary); margin-bottom:2px;">Electricity:</strong>
          ${escapeHtml(house.electricity)}
        </div>
      </div>

      <div style="display:flex; gap:12px;">
        <button type="button" class="btn btn-primary" style="flex:1;" id="modalBtnEnquire" data-id="${house.id}">
          Contact Caretaker / Book Viewing
        </button>
      </div>
    `;

    openModal('Property Details', html);
    document.getElementById('modalBtnEnquire')?.addEventListener('click', () => showEnquiryModal(house));
  }

  function showEnquiryModal(house) {
    const whatsappMsg = encodeURIComponent(
      `Hello ${house.caretaker || 'Caretaker'}, I saw the listing "${house.title}" in ${house.area} on KejaKU for ${formatMoney(house.rent)}/month. Is it currently vacant? I would like to arrange a viewing.`
    );
    const whatsappUrl = `https://wa.me/254712345678?text=${whatsappMsg}`;

    const html = `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:1.2rem; color:var(--text-main); margin-bottom:4px;">${escapeHtml(house.title)}</h3>
        <p style="color:var(--text-muted); font-size:0.88rem;">
          ${escapeHtml(house.area)} · ${formatMoney(house.rent)} / month · Contact: ${escapeHtml(house.caretaker || 'Property Caretaker')}
        </p>
      </div>

      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="whatsapp-direct-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.302c-.087.087-.178.181-.077.355.101.174.449.741.964 1.2.662.591 1.22.774 1.393.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
        Chat with Caretaker on WhatsApp
      </a>

      <div style="text-align:center; margin:16px 0; color:var(--text-muted); font-size:0.82rem; position:relative;">
        <span style="background:var(--bg-surface); padding:0 10px; position:relative; z-index:1;">OR SEND IN-APP MESSAGE</span>
        <div style="position:absolute; top:50%; left:0; right:0; height:1px; background:var(--border-subtle);"></div>
      </div>

      <form id="enquiryModalForm">
        <div class="form-grid-2 form-field">
          <div>
            <label class="form-label" for="enqStudentName">Your Name</label>
            <input type="text" id="enqStudentName" class="input-control" placeholder="e.g. Brian Otieno" required />
          </div>
          <div>
            <label class="form-label" for="enqStudentPhone">Phone or WhatsApp</label>
            <input type="tel" id="enqStudentPhone" class="input-control" placeholder="0712 345 678" required />
          </div>
        </div>

        <div class="form-field">
          <label class="form-label" for="enqViewingDate">Preferred Viewing Date</label>
          <input type="date" id="enqViewingDate" class="input-control" />
        </div>

        <div class="form-field">
          <label class="form-label" for="enqStudentMessage">Message to Caretaker</label>
          <textarea id="enqStudentMessage" rows="3" class="input-control" required>Hi, I am interested in viewing this house near Kenyatta University. Is it available for immediate move-in?</textarea>
        </div>

        <button type="submit" class="btn btn-primary" style="width:100%; padding:12px;">
          Send Viewing Request
        </button>
      </form>
    `;

    openModal('Enquire / Book Viewing', html);
    document.getElementById('enquiryModalForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        houseId: house.id,
        houseTitle: house.title,
        studentName: document.getElementById('enqStudentName').value,
        studentPhone: document.getElementById('enqStudentPhone').value,
        viewingDate: document.getElementById('enqViewingDate').value,
        message: document.getElementById('enqStudentMessage').value
      };

      // Try sending to backend
      try {
        fetch(`${API_BASE}/enquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch {}

      closeModal();
      showToast(`Viewing request sent! ${house.caretaker || 'The caretaker'} will contact you soon.`);
    });
  }

  function showListHouseModal(onCreated) {
    const html = `
      <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:16px;">
        Are you a KU area caretaker or landlord? Submit property information to help students find clean, honest housing.
      </p>

      <form id="listNewHouseForm">
        <div class="form-field">
          <label class="form-label" for="newHouseTitle">Listing Title</label>
          <input type="text" id="newHouseTitle" class="input-control" placeholder="e.g. Executive Tiled Bedsitter near KU Gate" required />
        </div>

        <div class="form-grid-2 form-field">
          <div>
            <label class="form-label" for="newHouseArea">Location Area</label>
            <select id="newHouseArea" class="input-control" required>
              <option value="">Select Area</option>
              <option value="Kahawa Wendani">Kahawa Wendani</option>
              <option value="Kahawa Sukari">Kahawa Sukari</option>
              <option value="Near KU main gate">Near KU main gate (KM)</option>
              <option value="Ruiru">Ruiru</option>
            </select>
          </div>
          <div>
            <label class="form-label" for="newHouseType">Room Type</label>
            <select id="newHouseType" class="input-control" required>
              <option value="">Select Room Type</option>
              <option value="Bedsitter">Bedsitter</option>
              <option value="Single room">Single room</option>
              <option value="Shared room">Shared room</option>
              <option value="Hostel">Hostel</option>
              <option value="1 Bedroom">1 Bedroom</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2 form-field">
          <div>
            <label class="form-label" for="newHouseRent">Monthly Rent (KSh)</label>
            <input type="number" id="newHouseRent" class="input-control" placeholder="e.g. 5000" min="1000" required />
          </div>
          <div>
            <label class="form-label" for="newHouseDeposit">Security Deposit (KSh)</label>
            <input type="number" id="newHouseDeposit" class="input-control" placeholder="e.g. 5000" min="0" required />
          </div>
        </div>

        <div class="form-grid-2 form-field">
          <div>
            <label class="form-label" for="newHouseDistance">Distance / Commute</label>
            <input type="text" id="newHouseDistance" class="input-control" placeholder="e.g. 6 min walk to KU Nyayo Gate" required />
          </div>
          <div>
            <label class="form-label" for="newHouseLandmark">Specific Landmark</label>
            <input type="text" id="newHouseLandmark" class="input-control" placeholder="e.g. Opposite Magunas" required />
          </div>
        </div>

        <div class="form-grid-2 form-field">
          <div>
            <label class="form-label" for="newHouseWater">Water Supply</label>
            <input type="text" id="newHouseWater" class="input-control" placeholder="e.g. Borehole 24/7 on-site" required />
          </div>
          <div>
            <label class="form-label" for="newHouseElectricity">Electricity</label>
            <input type="text" id="newHouseElectricity" class="input-control" placeholder="e.g. Token Meter in room" required />
          </div>
        </div>

        <div class="form-field">
          <label class="form-label" for="newHouseImage">Photo URL (Optional)</label>
          <input type="url" id="newHouseImage" class="input-control" placeholder="https://images.unsplash.com/..." />
          <span class="form-help">Leave empty to use a default high-quality student apartment image.</span>
        </div>

        <div class="form-field">
          <label class="form-label" for="newHouseDescription">Description & Amenities</label>
          <textarea id="newHouseDescription" rows="3" class="input-control" placeholder="Describe the room, compound security, gate hours, amenities..." required></textarea>
        </div>

        <button type="submit" class="btn btn-primary" style="width:100%; padding:13px;">
          Publish Property Listing
        </button>
      </form>
    `;

    openModal('List a House on KejaKU', html);
    document.getElementById('listNewHouseForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newHouse = {
        id: Date.now(),
        title: document.getElementById('newHouseTitle').value,
        area: document.getElementById('newHouseArea').value,
        landmark: document.getElementById('newHouseLandmark').value,
        type: document.getElementById('newHouseType').value,
        rent: Number(document.getElementById('newHouseRent').value),
        deposit: Number(document.getElementById('newHouseDeposit').value),
        garbageFee: 150,
        distance: document.getElementById('newHouseDistance').value,
        water: document.getElementById('newHouseWater').value,
        electricity: document.getElementById('newHouseElectricity').value,
        status: 'unverified',
        caretaker: 'Self Listed Landlord',
        phone: '+254700000000',
        image: document.getElementById('newHouseImage').value || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        features: ['Newly Listed', 'Borehole Water', 'Tokens'],
        description: document.getElementById('newHouseDescription').value
      };

      // Try sending to backend
      try {
        fetch(`${API_BASE}/houses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newHouse)
        }).catch(() => {});
      } catch {}

      closeModal();
      showToast('Property published successfully!');
      if (typeof onCreated === 'function') onCreated(newHouse);
    });
  }

  // 8. Application State & Setup
  const state = {
    houses: [...defaultHouses],
    filters: {
      keyword: '',
      area: '',
      type: '',
      minRent: 0,
      maxRent: 15000,
      verifiedOnly: false,
      savedOnly: false,
      sortBy: 'recommended'
    }
  };

  async function loadInitialHouses() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/houses`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          state.houses = json.data;
          renderListings();
        }
      }
    } catch {
      // Backend not running; fallback to defaultHouses (already in state)
    }
  }

  function renderListings() {
    const container = document.getElementById('listingsGrid');
    const countBadge = document.getElementById('resultsCountBadge');
    const sectionTitle = document.getElementById('resultsSectionTitle');
    if (!container) return;

    const results = filterHouses(state.houses, state.filters);

    if (sectionTitle) {
      sectionTitle.textContent = state.filters.savedOnly ? 'Your Bookmarked Houses' : 'Available Student Rentals';
    }
    if (countBadge) {
      countBadge.textContent = `${results.length} ${results.length === 1 ? 'property found' : 'properties found'}`;
    }

    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <h3>No properties match your filters</h3>
          <p>Try widening your search budget, selecting all areas, or clearing specific filters.</p>
          <button type="button" class="btn btn-primary" id="btnEmptyReset">
            Reset All Filters
          </button>
        </div>
      `;
      document.getElementById('btnEmptyReset')?.addEventListener('click', resetAllFilters);
      return;
    }

    container.innerHTML = results.map(house => createHouseCard(house)).join('');
  }

  function resetAllFilters() {
    state.filters = {
      keyword: '',
      area: '',
      type: '',
      minRent: 0,
      maxRent: 15000,
      verifiedOnly: false,
      savedOnly: false,
      sortBy: 'recommended'
    };

    const filterSearch = document.getElementById('filterSearch');
    if (filterSearch) filterSearch.value = '';
    const heroKeyword = document.getElementById('heroKeyword');
    if (heroKeyword) heroKeyword.value = '';
    const filterArea = document.getElementById('filterArea');
    if (filterArea) filterArea.value = '';
    const heroArea = document.getElementById('heroArea');
    if (heroArea) heroArea.value = '';
    const filterType = document.getElementById('filterType');
    if (filterType) filterType.value = '';
    const heroType = document.getElementById('heroType');
    if (heroType) heroType.value = '';
    const priceRange = document.getElementById('priceRange');
    if (priceRange) priceRange.value = 15000;
    const priceDisplay = document.getElementById('priceDisplay');
    if (priceDisplay) priceDisplay.textContent = formatMoney(15000);
    const heroMaxBudget = document.getElementById('heroMaxBudget');
    if (heroMaxBudget) heroMaxBudget.value = '';
    const verifiedOnly = document.getElementById('verifiedOnly');
    if (verifiedOnly) verifiedOnly.checked = false;
    const sortBy = document.getElementById('sortBy');
    if (sortBy) sortBy.value = 'recommended';
    const btnSavedHouses = document.getElementById('btnSavedHouses');
    if (btnSavedHouses) {
      const btnText = btnSavedHouses.querySelector('.btn-label');
      if (btnText) btnText.textContent = 'Saved Houses';
    }

    updateChipActiveState('');
    renderListings();
    showToast('Filters cleared');
  }

  function updateChipActiveState(selectedType) {
    const chips = document.querySelectorAll('#filterChips .chip');
    chips.forEach(chip => {
      chip.classList.toggle('active', (chip.dataset.type || '') === selectedType);
    });
  }

  function initApp() {
    initModal();
    updateSavedBadgeCount();
    loadInitialHouses();

    // Event listeners
    const btnMobileFilters = document.getElementById('btnMobileFilters');
    const filterCard = document.getElementById('filterCard');
    if (btnMobileFilters && filterCard) {
      btnMobileFilters.addEventListener('click', () => {
        filterCard.classList.toggle('open-mobile');
        btnMobileFilters.textContent = filterCard.classList.contains('open-mobile')
          ? 'Hide Filter Options ▲'
          : 'Show Filter Options ▼';
      });
    }

    document.getElementById('filterSearch')?.addEventListener('input', (e) => {
      state.filters.keyword = e.target.value;
      renderListings();
    });

    document.getElementById('filterArea')?.addEventListener('change', (e) => {
      state.filters.area = e.target.value;
      const heroArea = document.getElementById('heroArea');
      if (heroArea) heroArea.value = e.target.value;
      renderListings();
    });

    document.getElementById('filterType')?.addEventListener('change', (e) => {
      state.filters.type = e.target.value;
      updateChipActiveState(e.target.value);
      const heroType = document.getElementById('heroType');
      if (heroType) heroType.value = e.target.value;
      renderListings();
    });

    const priceRange = document.getElementById('priceRange');
    const priceDisplay = document.getElementById('priceDisplay');
    if (priceRange && priceDisplay) {
      priceRange.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        state.filters.maxRent = val;
        priceDisplay.textContent = formatMoney(val);
        renderListings();
      });
    }

    document.getElementById('verifiedOnly')?.addEventListener('change', (e) => {
      state.filters.verifiedOnly = e.target.checked;
      renderListings();
    });

    document.getElementById('sortBy')?.addEventListener('change', (e) => {
      state.filters.sortBy = e.target.value;
      renderListings();
    });

    document.getElementById('filterChips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const typeVal = chip.dataset.type || '';
      state.filters.type = typeVal;
      const filterType = document.getElementById('filterType');
      if (filterType) filterType.value = typeVal;
      const heroType = document.getElementById('heroType');
      if (heroType) heroType.value = typeVal;
      updateChipActiveState(typeVal);
      renderListings();
    });

    document.getElementById('btnResetFilters')?.addEventListener('click', resetAllFilters);

    document.getElementById('btnHeroSearch')?.addEventListener('click', () => {
      const heroArea = document.getElementById('heroArea')?.value || '';
      const heroType = document.getElementById('heroType')?.value || '';
      const heroMaxBudget = Number(document.getElementById('heroMaxBudget')?.value || 15000);
      const heroKeyword = document.getElementById('heroKeyword')?.value || '';

      state.filters.area = heroArea;
      state.filters.type = heroType;
      state.filters.maxRent = heroMaxBudget;
      state.filters.keyword = heroKeyword;
      state.filters.savedOnly = false;

      const filterArea = document.getElementById('filterArea');
      if (filterArea) filterArea.value = heroArea;
      const filterType = document.getElementById('filterType');
      if (filterType) filterType.value = heroType;
      const filterSearch = document.getElementById('filterSearch');
      if (filterSearch) filterSearch.value = heroKeyword;
      if (priceRange) {
        priceRange.value = heroMaxBudget;
        if (priceDisplay) priceDisplay.textContent = formatMoney(heroMaxBudget);
      }
      updateChipActiveState(heroType);

      renderListings();
      document.getElementById('listingsSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btnSavedHouses')?.addEventListener('click', () => {
      state.filters.savedOnly = !state.filters.savedOnly;
      const btnText = document.getElementById('btnSavedHouses').querySelector('.btn-label');
      if (btnText) {
        btnText.textContent = state.filters.savedOnly ? 'Show All Houses' : 'Saved Houses';
      }
      renderListings();
      document.getElementById('listingsSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btnListHouse')?.addEventListener('click', () => {
      showListHouseModal((newHouse) => {
        state.houses.unshift(newHouse);
        renderListings();
        document.getElementById('listingsSection')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);

    document.getElementById('listingsGrid')?.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('button[data-action]');
      if (!targetBtn) return;
      const action = targetBtn.dataset.action;
      const houseId = Number(targetBtn.dataset.id);
      const house = state.houses.find(h => h.id === houseId);
      if (!house) return;

      if (action === 'details') {
        showHouseDetails(house);
      } else if (action === 'enquire') {
        showEnquiryModal(house);
      } else if (action === 'toggle-save') {
        const nowSaved = toggleSaveHouse(house.id, house.title);
        targetBtn.classList.toggle('is-saved', nowSaved);
        targetBtn.setAttribute('title', nowSaved ? 'Remove from saved' : 'Save house');
        const svg = targetBtn.querySelector('svg');
        if (svg) svg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
        if (state.filters.savedOnly) {
          renderListings();
        }
      }
    });

    // Wire up footer links
    document.getElementById('footerListLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('btnListHouse')?.click();
    });

    renderListings();
  }

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
