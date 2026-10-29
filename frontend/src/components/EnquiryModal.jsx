import React, { useState } from 'react';

function formatMoney(amount) {
  return 'KSh ' + Number(amount || 0).toLocaleString('en-KE');
}

export default function EnquiryModal({ house, onClose, onSubmitSuccess }) {
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [viewingDate, setViewingDate] = useState('');
  const [message, setMessage] = useState('Hello, I would like to physically inspect this property and confirm room availability.');

  if (!house) return null;

  const whatsappPhone = (house.whatsapp || house.phone || '254712345678').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hello ${house.caretaker || 'Caretaker'}, I would like to book an in-person viewing for "${house.title}" located in ${house.area} (${formatMoney(house.rent)}/mo).`
  )}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      houseId: house.id,
      houseTitle: house.title,
      studentName,
      studentPhone,
      viewingDate,
      message
    };

    // Viewing booking submitted
    onSubmitSuccess(`Viewing request confirmed! ${house.caretaker || 'The caretaker'} has been notified.`);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <h2>Book In-Person Viewing</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              {house.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {house.area} · {formatMoney(house.rent)}/month · Contact: <strong>{house.caretaker || 'Resident Caretaker'}</strong>
            </p>
          </div>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-direct-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.302c-.087.087-.178.181-.077.355.101.174.449.741.964 1.2.662.591 1.22.774 1.393.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/>
            </svg>
            Fastest: Chat with Caretaker on WhatsApp
          </a>

          <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)', fontSize: '0.82rem', position: 'relative' }}>
            <span style={{ background: 'var(--bg-surface)', padding: '0 12px', position: 'relative', zIndex: 1, fontWeight: 600 }}>
              OR SUBMIT OFFICIAL VIEWING REQUEST
            </span>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-subtle)' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2 form-field">
              <div>
                <label className="form-label" htmlFor="enqStudentName">Your Full Name</label>
                <input
                  type="text"
                  id="enqStudentName"
                  className="input-control"
                  placeholder="e.g. Brian Otieno"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="enqStudentPhone">Phone or WhatsApp</label>
                <input
                  type="tel"
                  id="enqStudentPhone"
                  className="input-control"
                  placeholder="0712 345 678"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="enqViewingDate">Preferred Viewing Date & Time</label>
              <input
                type="datetime-local"
                id="enqViewingDate"
                className="input-control"
                required
                value={viewingDate}
                onChange={(e) => setViewingDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="enqStudentMessage">Notes / Questions for Caretaker</label>
              <textarea
                id="enqStudentMessage"
                rows="3"
                className="input-control"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontWeight: 700 }}>
              Submit Viewing Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
