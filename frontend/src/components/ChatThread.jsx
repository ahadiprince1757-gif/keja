import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Phone, Home, Calendar, AlertCircle, Send } from 'lucide-react';

function formatTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

export default function ChatThread({ enquiry, onReplied }) {
  const { authFetch } = useAuth();
  const [text, setText]       = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');
  const bottomRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [enquiry?.messages?.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setError('');
    setSending(true);

    try {
      const res  = await authFetch(`/api/accounts/me/enquiries/${enquiry.id}/reply`, {
        method: 'POST',
        body:   JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to send reply.');
        setSending(false);
        return;
      }
      setText('');
      onReplied(data.enquiry);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!enquiry) {
    return (
      <div className="enquiry-chat-panel">
        <div className="chat-empty-state">
          <div className="chat-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <MessageSquare size={48} strokeWidth={1.5} color="var(--primary)" />
          </div>
          <p>Select an enquiry to view the conversation</p>
        </div>
      </div>
    );
  }

  const messages = Array.isArray(enquiry.messages) ? enquiry.messages : [];

  return (
    <div className="enquiry-chat-panel">
      <div className="chat-header">
        <div className="chat-header-name">{enquiry.studentName}</div>
        <div className="chat-header-sub" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={13} color="var(--primary)" /> {enquiry.studentPhone}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Home size={13} color="var(--text-muted)" /> {enquiry.houseTitle}
          </span>
          {enquiry.viewingDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} color="var(--text-muted)" /> Viewing: {enquiry.viewingDate}
            </span>
          )}
        </div>
      </div>

      <div className="chat-messages-scroll">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: '0.9rem' }}>
            No messages yet. Reply below to start the conversation.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwner = msg.from === 'owner';
            return (
              <div key={idx} className={`chat-bubble-wrapper ${isOwner ? 'owner-msg' : 'customer-msg'}`}>
                <div className="chat-bubble">{msg.text}</div>
                <div className="chat-bubble-meta">
                  {isOwner ? 'You' : msg.senderName || enquiry.studentName} · {formatTime(msg.at)}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div style={{ padding: '8px 20px' }}>
          <div className="auth-error-banner" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        </div>
      )}

      <form className="chat-reply-bar" onSubmit={handleSend}>
        <textarea
          className="chat-reply-input"
          placeholder="Type your reply…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
          }}
          rows={1}
          id="chat-reply-textarea"
        />
        <button
          type="submit"
          className="btn-send-reply"
          disabled={!text.trim() || sending}
          id="btn-send-reply"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          {sending ? '…' : (
            <>
              <Send size={14} /> Send
            </>
          )}
        </button>
      </form>
    </div>
  );
}
