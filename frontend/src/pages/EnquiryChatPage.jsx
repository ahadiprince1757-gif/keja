import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatThread from '../components/ChatThread';
import { MessageSquare, Home } from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }); }
  catch { return ''; }
}

function lastMessage(enquiry) {
  const msgs = enquiry.messages || [];
  if (msgs.length === 0) return enquiry.message || 'No messages yet';
  return msgs[msgs.length - 1].text;
}

export default function EnquiryChatPage() {
  const { authFetch }                 = useAuth();
  const [enquiries, setEnquiries]     = useState([]);
  const [selected, setSelected]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');

  useEffect(() => {
    authFetch('/api/accounts/me/enquiries')
      .then(r => r.json())
      .then(data => { if (data.success) setEnquiries(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // When an owner replies, merge updated enquiry back into state
  const handleReplied = (updatedEnquiry) => {
    setEnquiries(prev =>
      prev.map(e => e.id === updatedEnquiry.id ? { ...updatedEnquiry, houseTitle: e.houseTitle } : e)
    );
    setSelected(prev => prev?.id === updatedEnquiry.id ? { ...updatedEnquiry, houseTitle: prev.houseTitle } : prev);
  };

  const filtered = enquiries.filter(e =>
    !searchTerm ||
    e.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.houseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <h2 className="section-title">Enquiries ({enquiries.length})</h2>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading enquiries…
        </div>
      ) : enquiries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <MessageSquare size={48} strokeWidth={1.5} color="var(--primary)" />
          </div>
          <h3>No enquiries yet</h3>
          <p>When students enquire about your listings, the conversations will appear here.</p>
        </div>
      ) : (
        <div className="enquiry-chat-layout">
          {/* Left: Enquiry List */}
          <div className="enquiry-list-panel">
            <div className="enquiry-list-header">
              <input
                type="search"
                className="form-input"
                placeholder="Search by name or house…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ marginTop: 4 }}
                id="enquiry-search"
              />
            </div>
            <div className="enquiry-list-scroll">
              {filtered.length === 0 ? (
                <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No results.</div>
              ) : filtered.map(enq => (
                <div
                  key={enq.id}
                  className={`enquiry-item${selected?.id === enq.id ? ' active' : ''}`}
                  onClick={() => setSelected(enq)}
                  role="button"
                  tabIndex={0}
                  id={`enquiry-item-${enq.id}`}
                  onKeyDown={e => e.key === 'Enter' && setSelected(enq)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="enquiry-item-name">{enq.studentName}</div>
                    <span className={`enquiry-item-badge badge-${enq.status || 'open'}`}>
                      {enq.status === 'replied' ? 'Replied' : 'Open'}
                    </span>
                  </div>
                  <div className="enquiry-item-house" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Home size={13} color="var(--text-muted)" /> {enq.houseTitle}
                  </div>
                  <div className="enquiry-item-preview">{lastMessage(enq)}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {formatDate(enq.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chat Thread */}
          <ChatThread enquiry={selected} onReplied={handleReplied} />
        </div>
      )}
    </div>
  );
}
