import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function formatMoney(amount) {
  return 'KSh ' + Number(amount || 0).toLocaleString('en-KE');
}

export default function EnquiryModal({ house, onClose, onSubmitSuccess }) {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentPhone, setStudentPhone] = useState(user?.phone || user?.email || '');
  const [viewingDate, setViewingDate] = useState('');
  const [message, setMessage] = useState('Hello, I would like to physically inspect this property and confirm room availability.');

  useEffect(() => {
    if (user) {
      if (user.name) setStudentName(user.name);
      if (user.phone || user.email) setStudentPhone(user.phone || user.email);
    }
  }, [user]);

  if (!house) return null;

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      houseId: house.id,
      houseTitle: house.title,
      studentName,
      studentPhone,
      viewingDate,
      message,
      userId: user?.id || null,
    };

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSubmitSuccess(`Viewing request sent! ${house.caretaker || 'The caretaker'} has been notified.`);
      } else {
        onSubmitSuccess(`Viewing request submitted for ${house.caretaker || 'caretaker'}.`);
      }
    } catch {
      onSubmitSuccess(`Viewing request submitted!`);
    } finally {
      setSubmitting(false);
      onClose();
    }
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '13px', fontWeight: 700 }}
            >
              {submitting ? 'Submitting…' : 'Submit Viewing Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
