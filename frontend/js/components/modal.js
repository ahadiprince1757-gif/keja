/**
 * Modal Dialog Component — Production Grade
 * Handles interactive multi-image galleries, detailed specifications,
 * booking viewings, and property listings with multi-image file/URL uploads.
 */

import { formatMoney, escapeHtml } from './card.js';
import { showToast } from './toast.js';

let modalBackdrop = null;
let modalContainer = null;

export function initModal() {
  modalBackdrop = document.getElementById('modalBackdrop');
  modalContainer = document.getElementById('modalContainer');

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop?.classList.contains('open')) {
      closeModal();
    }
  });
}

export function openModal(headerTitle, bodyHtml, maxWidth = '680px') {
  if (!modalBackdrop || !modalContainer) return;

  const header = modalContainer.querySelector('.modal-header h2');
  const body = modalContainer.querySelector('.modal-body');

  modalContainer.style.maxWidth = maxWidth;
  if (header) header.textContent = headerTitle;
  if (body) body.innerHTML = bodyHtml;

  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Show Detailed House View with Interactive Photo Gallery & Specs
 */
export function showHouseDetails(house) {
  const images = (Array.isArray(house.images) && house.images.length > 0)
    ? house.images
    : (house.image ? [house.image] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80']);

  const totalMoveIn = (house.rent || 0) + (house.deposit || 0) + (house.garbageFee || 150);

  // Generate thumbnail buttons HTML
  const thumbnailsHtml = images.map((img, idx) => `
    <button type="button" class="gallery-thumb-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}">
      <img src="${escapeHtml(img)}" alt="Thumbnail ${idx + 1}" />
    </button>
  `).join('');

  // Generate amenities list
  const amenitiesListHtml = (house.features || [
    'Borehole Water', 'Token Meter', 'Tiled Floor', 'Instant Hot Shower'
  ]).map(f => `
    <div class="modal-feature-item">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${escapeHtml(f)}</span>
    </div>
  `).join('');

  // House rules list
  const rulesListHtml = (house.rules || [
    'Rent due on the 5th of every month',
    'Quiet hours observed after 10 PM',
    'Clean shared corridors after use'
  ]).map(r => `<li>${escapeHtml(r)}</li>`).join('');

  const html = `
    <!-- Interactive Photo Gallery Carousel -->
    <div class="product-gallery">
      <div class="gallery-main-view">
        <img id="galleryMainImg" src="${escapeHtml(images[0])}" alt="${escapeHtml(house.title)}" />
        
        ${images.length > 1 ? `
          <button type="button" class="gallery-nav-arrow arrow-left" id="galleryPrevBtn" aria-label="Previous image">‹</button>
          <button type="button" class="gallery-nav-arrow arrow-right" id="galleryNextBtn" aria-label="Next image">›</button>
        ` : ''}

        <div class="gallery-counter-badge" id="galleryCounterBadge">
          1 / ${images.length}
        </div>
      </div>

      ${images.length > 1 ? `
        <div class="gallery-thumbnails-strip" id="galleryThumbnailsStrip">
          ${thumbnailsHtml}
        </div>
      ` : ''}
    </div>

    <!-- Header & Price Summary -->
    <div class="detail-header-row">
      <div>
        <h3 class="detail-title">${escapeHtml(house.title)}</h3>
        <p class="detail-location-sub">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <strong>${escapeHtml(house.area)}</strong> · ${escapeHtml(house.landmark || '')}
        </p>
      </div>
      <div class="detail-price-box">
        <div class="detail-price-val">${formatMoney(house.rent)}<small>/mo</small></div>
        <span class="detail-vacancy-pill">${escapeHtml(house.vacantUnits ? `${house.vacantUnits} Rooms Vacant` : 'Available')}</span>
      </div>
    </div>

    <!-- Verified Badge Alert -->
    <div class="verified-trust-card">
      <div class="trust-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div>
        <strong>KejaKU Verified Listing</strong>
        <p>Physical inspection confirmed active vacancy, working lock & key, high tap pressure, and registered caretaker.</p>
      </div>
    </div>

    <!-- Quick Spec Chips -->
    <div class="detail-quick-specs">
      <div class="spec-cell">
        <span class="spec-label">Room Type</span>
        <span class="spec-val">${escapeHtml(house.type)}</span>
      </div>
      <div class="spec-cell">
        <span class="spec-label">Floor</span>
        <span class="spec-val">${escapeHtml(house.floor || '1st Floor')}</span>
      </div>
      <div class="spec-cell">
        <span class="spec-label">Commute to Campus</span>
        <span class="spec-val">${escapeHtml(house.distance)}</span>
      </div>
      <div class="spec-cell">
        <span class="spec-label">Gate Access</span>
        <span class="spec-val">${escapeHtml(house.gateCurfew || 'Resident Key')}</span>
      </div>
    </div>

    <!-- Property Description -->
    <div class="detail-section">
      <h4 class="section-subheading">About the Residence</h4>
      <p class="detail-description-text">${escapeHtml(house.description)}</p>
    </div>

    <!-- Key Amenities Checklist -->
    <div class="detail-section">
      <h4 class="section-subheading">Features & Amenities</h4>
      <div class="modal-features-grid">
        ${amenitiesListHtml}
      </div>
    </div>

    <!-- Pricing & Utility Transparency Breakdown -->
    <div class="detail-section">
      <h4 class="section-subheading">Move-in Cost Breakdown</h4>
      <table class="modal-breakdown-table">
        <tr>
          <td>1st Month Rent</td>
          <td>${formatMoney(house.rent)}</td>
        </tr>
        <tr>
          <td>Refundable Security Deposit</td>
          <td>${formatMoney(house.deposit)}</td>
        </tr>
        <tr>
          <td>Monthly Garbage Collection</td>
          <td>${formatMoney(house.garbageFee || 150)}</td>
        </tr>
        <tr>
          <td>Water Supply Details</td>
          <td style="font-size:0.85rem; font-weight:normal;">${escapeHtml(house.water)}</td>
        </tr>
        <tr>
          <td>Electricity / Tokens</td>
          <td style="font-size:0.85rem; font-weight:normal;">${escapeHtml(house.electricity)}</td>
        </tr>
        <tr>
          <td>Internet / Wi-Fi</td>
          <td style="font-size:0.85rem; font-weight:normal;">${escapeHtml(house.wifi || 'Available')}</td>
        </tr>
        <tr class="table-total-row">
          <td>Estimated Initial Move-In Total</td>
          <td style="color:var(--primary); font-size:1.15rem; font-weight:800;">${formatMoney(totalMoveIn)}</td>
        </tr>
      </table>
    </div>

    <!-- House Rules -->
    <div class="detail-section">
      <h4 class="section-subheading">Building Regulations</h4>
      <ul class="detail-rules-list">
        ${rulesListHtml}
      </ul>
    </div>

    <!-- Caretaker Contact & Action Buttons -->
    <div class="caretaker-card">
      <div class="caretaker-info">
        <div class="caretaker-avatar">
          ${escapeHtml((house.caretaker || 'C')[0])}
        </div>
        <div>
          <div class="caretaker-name">${escapeHtml(house.caretaker || 'Resident Caretaker')}</div>
          <div class="caretaker-role">Authorized Property Manager · Typically replies in &lt; 15 mins</div>
        </div>
      </div>

      <div class="caretaker-actions-grid">
        <a href="https://wa.me/${(house.whatsapp || house.phone || '254712345678').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${house.caretaker || 'Caretaker'}, I found your listing "${house.title}" on KejaKU (${formatMoney(house.rent)}/mo). Is it vacant? I would like to schedule a physical viewing.`)}" 
           target="_blank" rel="noopener noreferrer" class="btn whatsapp-direct-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.302c-.087.087-.178.181-.077.355.101.174.449.741.964 1.2.662.591 1.22.774 1.393.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
          WhatsApp Caretaker
        </a>

        <button type="button" class="btn btn-primary" id="modalBtnBookViewing" data-id="${house.id}">
          Schedule Viewing Date
        </button>
      </div>
    </div>
  `;

  openModal('Property Details & Gallery', html, '720px');

  // Setup Gallery Carousel Interactivity
  let currentImgIdx = 0;
  const mainImgEl = document.getElementById('galleryMainImg');
  const counterEl = document.getElementById('galleryCounterBadge');
  const thumbBtns = document.querySelectorAll('.gallery-thumb-btn');

  function updateGallery(idx) {
    currentImgIdx = (idx + images.length) % images.length;
    if (mainImgEl) mainImgEl.src = images[currentImgIdx];
    if (counterEl) counterEl.textContent = `${currentImgIdx + 1} / ${images.length}`;

    thumbBtns.forEach((btn, i) => {
      btn.classList.toggle('active', i === currentImgIdx);
    });
  }

  document.getElementById('galleryPrevBtn')?.addEventListener('click', () => updateGallery(currentImgIdx - 1));
  document.getElementById('galleryNextBtn')?.addEventListener('click', () => updateGallery(currentImgIdx + 1));

  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      updateGallery(idx);
    });
  });

  document.getElementById('modalBtnBookViewing')?.addEventListener('click', () => {
    showEnquiryModal(house);
  });
}

/**
 * Show Booking / Viewing Request Modal
 */
export function showEnquiryModal(house) {
  const whatsappUrl = `https://wa.me/${(house.whatsapp || house.phone || '254712345678').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${house.caretaker || 'Caretaker'}, I would like to book an in-person viewing for "${house.title}" located in ${house.area} (${formatMoney(house.rent)}/mo).`
  )}`;

  const html = `
    <div style="margin-bottom:18px;">
      <h3 style="font-size:1.25rem; color:var(--text-main); margin-bottom:4px;">${escapeHtml(house.title)}</h3>
      <p style="color:var(--text-muted); font-size:0.88rem;">
        ${escapeHtml(house.area)} · ${formatMoney(house.rent)}/month · Contact: <strong>${escapeHtml(house.caretaker || 'Resident Caretaker')}</strong>
      </p>
    </div>

    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="whatsapp-direct-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.302c-.087.087-.178.181-.077.355.101.174.449.741.964 1.2.662.591 1.22.774 1.393.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
      Fastest: Chat with Caretaker on WhatsApp
    </a>

    <div style="text-align:center; margin:16px 0; color:var(--text-muted); font-size:0.82rem; position:relative;">
      <span style="background:var(--bg-surface); padding:0 12px; position:relative; z-index:1; font-weight:600;">OR SUBMIT OFFICIAL VIEWING REQUEST</span>
      <div style="position:absolute; top:50%; left:0; right:0; height:1px; background:var(--border-subtle);"></div>
    </div>

    <form id="enquiryModalForm">
      <div class="form-grid-2 form-field">
        <div>
          <label class="form-label" for="enqStudentName">Your Full Name</label>
          <input type="text" id="enqStudentName" class="input-control" placeholder="e.g. Brian Otieno" required />
        </div>
        <div>
          <label class="form-label" for="enqStudentPhone">Phone or WhatsApp</label>
          <input type="tel" id="enqStudentPhone" class="input-control" placeholder="0712 345 678" required />
        </div>
      </div>

      <div class="form-field">
        <label class="form-label" for="enqViewingDate">Preferred Viewing Date & Time</label>
        <input type="datetime-local" id="enqViewingDate" class="input-control" required />
      </div>

      <div class="form-field">
        <label class="form-label" for="enqStudentMessage">Notes / Questions for Caretaker</label>
        <textarea id="enqStudentMessage" rows="3" class="input-control" required>Hello, I would like to physically inspect this property and confirm room availability.</textarea>
      </div>

      <button type="submit" class="btn btn-primary" style="width:100%; padding:13px; font-weight:700;">
        Submit Viewing Booking
      </button>
    </form>
  `;

  openModal('Book In-Person Viewing', html, '560px');

  document.getElementById('enquiryModalForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      houseId: house.id,
      houseTitle: house.title,
      studentName: document.getElementById('enqStudentName').value,
      studentPhone: document.getElementById('enqStudentPhone').value,
      viewingDate: document.getElementById('enqViewingDate').value,
      message: document.getElementById('enqStudentMessage').value
    };

    // Send to backend
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});

    closeModal();
    showToast(`Viewing request confirmed! ${house.caretaker || 'The caretaker'} has been notified.`);
  });
}

/**
 * Show List a House Modal with Multi-Image Upload (File + URLs)
 */
export function showListHouseModal(onCreated) {
  let uploadedPhotos = [];

  const html = `
    <p style="color:var(--text-secondary); font-size:0.92rem; margin-bottom:18px;">
      List your student property on the official KejaKU network. Include accurate photos, walking time to KU gates, and true rental rates.
    </p>

    <form id="listNewHouseForm">
      <!-- Section 1: Basic Information -->
      <div class="form-field">
        <label class="form-label" for="newHouseTitle">Listing Headline</label>
        <input type="text" id="newHouseTitle" class="input-control" placeholder="e.g. Spacious Tiled Bedsitter with Balcony & WiFi" required />
      </div>

      <div class="form-grid-2 form-field">
        <div>
          <label class="form-label" for="newHouseArea">KU Zone / Area</label>
          <select id="newHouseArea" class="input-control" required>
            <option value="">Select Zone</option>
            <option value="Kahawa Wendani">Kahawa Wendani</option>
            <option value="Kahawa Sukari">Kahawa Sukari</option>
            <option value="Near KU main gate">Near KU Main Gate (KM)</option>
            <option value="Ruiru">Ruiru Campus Route</option>
          </select>
        </div>
        <div>
          <label class="form-label" for="newHouseType">Room Category</label>
          <select id="newHouseType" class="input-control" required>
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
          <label class="form-label" for="newHouseFloor">Floor Level</label>
          <input type="text" id="newHouseFloor" class="input-control" placeholder="e.g. 2nd Floor, Ground Floor" value="1st Floor" required />
        </div>
        <div>
          <label class="form-label" for="newHouseVacant">Currently Vacant Rooms</label>
          <input type="number" id="newHouseVacant" class="input-control" min="1" max="50" value="1" required />
        </div>
      </div>

      <!-- Section 2: Financials & Utilities -->
      <div class="form-grid-2 form-field">
        <div>
          <label class="form-label" for="newHouseRent">Monthly Rent (KSh)</label>
          <input type="number" id="newHouseRent" class="input-control" placeholder="e.g. 5500" min="1000" step="100" required />
        </div>
        <div>
          <label class="form-label" for="newHouseDeposit">Security Deposit (KSh)</label>
          <input type="number" id="newHouseDeposit" class="input-control" placeholder="e.g. 5500" min="0" step="100" required />
        </div>
      </div>

      <div class="form-grid-2 form-field">
        <div>
          <label class="form-label" for="newHouseDistance">Walk / Commute to KU Gate</label>
          <input type="text" id="newHouseDistance" class="input-control" placeholder="e.g. 6 min walk to KU Nyayo Gate" required />
        </div>
        <div>
          <label class="form-label" for="newHouseLandmark">Specific Landmark / Route</label>
          <input type="text" id="newHouseLandmark" class="input-control" placeholder="e.g. Behind Magunas Supermarket" required />
        </div>
      </div>

      <div class="form-grid-2 form-field">
        <div>
          <label class="form-label" for="newHouseWater">Water Supply</label>
          <input type="text" id="newHouseWater" class="input-control" value="Borehole on-site 24/7 (High Pressure)" required />
        </div>
        <div>
          <label class="form-label" for="newHouseElectricity">Electricity</label>
          <input type="text" id="newHouseElectricity" class="input-control" value="Individual Prepaid KPLC Token Meter" required />
        </div>
      </div>

      <div class="form-grid-2 form-field">
        <div>
          <label class="form-label" for="newHouseWifi">Wi-Fi Connection</label>
          <input type="text" id="newHouseWifi" class="input-control" value="Free Fiber WiFi Included" />
        </div>
        <div>
          <label class="form-label" for="newHouseCurfew">Gate Hours</label>
          <input type="text" id="newHouseCurfew" class="input-control" value="Open 24/7 (Resident Key Provided)" />
        </div>
      </div>

      <!-- Section 3: Multi-Image Upload (File + URLs) -->
      <div class="form-field image-upload-section">
        <label class="form-label">Property Photos (Upload Multiple)</label>
        
        <div class="file-dropzone" id="fileDropzone">
          <input type="file" id="multiFileInput" multiple accept="image/*" style="display:none;" />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <div>
            <strong>Click to upload photos</strong> or drag & drop images here
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">Supports PNG, JPG, WebP. First image becomes the cover photo.</div>
          </div>
        </div>

        <!-- Add image via URL -->
        <div style="display:flex; gap:8px; margin-top:10px;">
          <input type="url" id="singleUrlInput" class="input-control" placeholder="Or paste an image URL..." />
          <button type="button" class="btn" id="btnAddPhotoUrl" style="white-space:nowrap;">+ Add URL</button>
        </div>

        <!-- Live Preview Thumbnails Strip -->
        <div class="upload-preview-grid" id="uploadPreviewGrid">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Section 4: Caretaker Contact Info -->
      <div class="form-grid-2 form-field">
        <div>
          <label class="form-label" for="newHouseCaretaker">Caretaker / Landlord Name</label>
          <input type="text" id="newHouseCaretaker" class="input-control" placeholder="e.g. Mr. Mwangi" required />
        </div>
        <div>
          <label class="form-label" for="newHousePhone">Phone / WhatsApp Number</label>
          <input type="tel" id="newHousePhone" class="input-control" placeholder="+254 712 345 678" required />
        </div>
      </div>

      <!-- Section 5: Description -->
      <div class="form-field">
        <label class="form-label" for="newHouseDescription">Detailed Description</label>
        <textarea id="newHouseDescription" rows="3" class="input-control" placeholder="Describe the room size, ventilation, security features, student community..." required></textarea>
      </div>

      <button type="submit" class="btn btn-primary" style="width:100%; padding:14px; font-weight:700;">
        Publish Property Listing
      </button>
    </form>
  `;

  openModal('List a House on KejaKU', html, '680px');

  // Handle Multi-Image File Selection & Drag-and-Drop
  const dropzone = document.getElementById('fileDropzone');
  const fileInput = document.getElementById('multiFileInput');
  const previewGrid = document.getElementById('uploadPreviewGrid');
  const singleUrlInput = document.getElementById('singleUrlInput');
  const btnAddUrl = document.getElementById('btnAddPhotoUrl');

  function renderPreviews() {
    if (!previewGrid) return;
    if (uploadedPhotos.length === 0) {
      previewGrid.innerHTML = '';
      return;
    }

    previewGrid.innerHTML = uploadedPhotos.map((imgSrc, idx) => `
      <div class="upload-thumb-card ${idx === 0 ? 'is-cover' : ''}">
        <img src="${escapeHtml(imgSrc)}" alt="Uploaded photo ${idx + 1}" />
        ${idx === 0 ? '<span class="cover-tag">Cover</span>' : ''}
        <button type="button" class="thumb-remove-btn" data-index="${idx}" title="Remove image">×</button>
      </div>
    `).join('');

    previewGrid.querySelectorAll('.thumb-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const removeIdx = Number(btn.dataset.index);
        uploadedPhotos.splice(removeIdx, 1);
        renderPreviews();
      });
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });
  }

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedPhotos.push(event.target.result);
        renderPreviews();
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnAddUrl && singleUrlInput) {
    btnAddUrl.addEventListener('click', () => {
      const url = singleUrlInput.value.trim();
      if (url) {
        uploadedPhotos.push(url);
        singleUrlInput.value = '';
        renderPreviews();
      }
    });
  }

  // Handle Form Submission
  document.getElementById('listNewHouseForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Default sample image if none provided
    const finalImages = uploadedPhotos.length > 0
      ? uploadedPhotos
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

    const newHouse = {
      id: Date.now(),
      title: document.getElementById('newHouseTitle').value,
      area: document.getElementById('newHouseArea').value,
      landmark: document.getElementById('newHouseLandmark').value,
      type: document.getElementById('newHouseType').value,
      floor: document.getElementById('newHouseFloor').value,
      vacantUnits: Number(document.getElementById('newHouseVacant').value) || 1,
      rent: Number(document.getElementById('newHouseRent').value),
      deposit: Number(document.getElementById('newHouseDeposit').value),
      garbageFee: 150,
      distance: document.getElementById('newHouseDistance').value,
      water: document.getElementById('newHouseWater').value,
      electricity: document.getElementById('newHouseElectricity').value,
      wifi: document.getElementById('newHouseWifi').value,
      gateCurfew: document.getElementById('newHouseCurfew').value,
      caretaker: document.getElementById('newHouseCaretaker').value,
      phone: document.getElementById('newHousePhone').value,
      whatsapp: document.getElementById('newHousePhone').value,
      status: 'visited',
      verifiedDate: 'New Listing',
      image: finalImages[0],
      images: finalImages,
      features: ['Borehole Water', 'Token Meter', 'Tiled Floor', 'Verified Listing'],
      description: document.getElementById('newHouseDescription').value
    };

    // Post to backend API
    try {
      fetch('/api/houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHouse)
      }).catch(() => {});
    } catch {}

    closeModal();
    showToast('Property listing published successfully!');
    if (typeof onCreated === 'function') onCreated(newHouse);
  });
}
