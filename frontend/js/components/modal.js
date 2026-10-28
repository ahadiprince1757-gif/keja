/**
 * Modal Dialog Component
 * Manages House Details, Enquiry, Listing, and Report dialogs
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

export function openModal(headerTitle, bodyHtml) {
  if (!modalBackdrop || !modalContainer) return;

  const header = modalContainer.querySelector('.modal-header h2');
  const body = modalContainer.querySelector('.modal-body');

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
 * Show House Detailed View
 */
export function showHouseDetails(house) {
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
      <tr>
        <td>1st Month Rent</td>
        <td>${formatMoney(house.rent)}</td>
      </tr>
      <tr>
        <td>Refundable Security Deposit</td>
        <td>${formatMoney(house.deposit)}</td>
      </tr>
      <tr>
        <td>Garbage Collection (Monthly)</td>
        <td>${formatMoney(house.garbageFee || 150)}</td>
      </tr>
      <tr>
        <td>Estimated Initial Move-in Total</td>
        <td style="color:var(--primary); font-size:1.05rem;">${formatMoney(totalMoveIn)}</td>
      </tr>
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

  const btnEnquire = document.getElementById('modalBtnEnquire');
  if (btnEnquire) {
    btnEnquire.addEventListener('click', () => {
      showEnquiryModal(house);
    });
  }
}

/**
 * Show Enquiry & Direct WhatsApp Contact Modal
 */
export function showEnquiryModal(house) {
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

  const form = document.getElementById('enquiryModalForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('enqStudentName').value;
      closeModal();
      showToast(`Viewing request sent! ${house.caretaker || 'The caretaker'} will contact you soon.`);
    });
  }
}

/**
 * Show List a House Modal (Allows adding a real property to the page)
 */
export function showListHouseModal(onListingCreated) {
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

  const form = document.getElementById('listNewHouseForm');
  if (form) {
    form.addEventListener('submit', (e) => {
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

      closeModal();
      showToast('Property published successfully!');
      if (typeof onListingCreated === 'function') {
        onListingCreated(newHouse);
      }
    });
  }
}


