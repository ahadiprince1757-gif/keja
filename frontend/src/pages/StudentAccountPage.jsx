import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import HouseCard from '../components/HouseCard';
import HouseDetailsModal from '../components/HouseDetailsModal';
import EnquiryModal from '../components/EnquiryModal';
import Toast from '../components/Toast';
import { defaultHouses } from '../data/houses';
import {
  Heart,
  MessageSquare,
  ArrowLeft,
  Send,
  User,
  LogOut,
  Building,
  GraduationCap
} from 'lucide-react';

function formatTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function StudentAccountPage() {
  const { user, logout, authFetch } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('liked'); // 'liked' or 'messages'
  const [savedHouses, setSavedHouses] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Modals for house interactions
  const [selectedHouseForDetails, setSelectedHouseForDetails] = useState(null);
  const [selectedHouseForEnquiry, setSelectedHouseForEnquiry] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 3200);
  };

  // Fetch saved houses (from /api/saved or fallback matching local houses)
  const fetchSaved = async () => {
    setLoadingSaved(true);
    try {
      const res = await authFetch('/api/saved');
      const data = await res.json();
      if (data.success && Array.isArray(data.saved)) {
        const housesList = data.saved.map(item => item.house).filter(Boolean);
        setSavedHouses(housesList);
      } else {
        const savedIds = JSON.parse(localStorage.getItem('kejaku_saved_houses_v2') || '[]');
        const matched = defaultHouses.filter(h => savedIds.includes(Number(h.id)));
        setSavedHouses(matched);
      }
    } catch {
      const savedIds = JSON.parse(localStorage.getItem('kejaku_saved_houses_v2') || '[]');
      const matched = defaultHouses.filter(h => savedIds.includes(Number(h.id)));
      setSavedHouses(matched);
    } finally {
      setLoadingSaved(false);
    }
  };

  // Fetch student enquiries / messages
  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await authFetch('/api/accounts/me/student-enquiries');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
        if (data.data.length > 0 && !selectedEnquiry) {
          setSelectedEnquiry(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching student messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchSaved();
    fetchMessages();
  }, []);

  const handleToggleSave = async (house) => {
    const numId = Number(house.id);
    setSavedHouses(prev => prev.filter(h => Number(h.id) !== numId));
    showToast(`Removed "${house.title}" from liked houses.`);

    try {
      const savedIds = JSON.parse(localStorage.getItem('kejaku_saved_houses_v2') || '[]');
      const filtered = savedIds.filter(id => Number(id) !== numId);
      localStorage.setItem('kejaku_saved_houses_v2', JSON.stringify(filtered));
    } catch {}

    try {
      await authFetch(`/api/saved/${numId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete save:', e);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedEnquiry || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await authFetch(`/api/accounts/me/student-enquiries/${selectedEnquiry.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ text: replyText.trim() })
      });
      const data = await res.json();
      if (data.success && data.enquiry) {
        setReplyText('');
        setMessages(prev => prev.map(m => m.id === data.enquiry.id ? data.enquiry : m));
        setSelectedEnquiry(data.enquiry);
        showToast('Message sent to caretaker!');
      }
    } catch {
      showToast('Failed to send message', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <div className="student-account-page">
      <Navbar savedCount={savedHouses.length} />

      <main className="student-account-main">
        <div className="student-account-container">
          
          {/* Profile Summary Card */}
          <section className="student-profile-card">
            <div className="student-profile-left">
              <div className="student-avatar" aria-hidden="true">
                {initials}
              </div>
              <div className="student-profile-details">
                <h1 className="student-name-title">
                  {user?.name || 'Student Account'}
                </h1>
                <div className="student-meta-row">
                  <span>{user?.email}</span>
                  {user?.phone && (
                    <>
                      <span className="student-meta-sep">•</span>
                      <span>{user?.phone}</span>
                    </>
                  )}
                  <span className="student-badge-role">
                    <GraduationCap size={12} strokeWidth={2.4} /> Student
                  </span>
                </div>
              </div>
            </div>

            <div className="student-profile-actions">
              <Link to="/" className="student-btn-action">
                <ArrowLeft size={15} />
                <span>Explore</span>
              </Link>
              <button
                type="button"
                className="student-btn-action student-btn-logout"
                onClick={logout}
                aria-label="Sign Out"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </section>

          {/* Navigation Tabs (Liked Houses & Messages) */}
          <nav className="student-tabs-nav" aria-label="Student Account Sections">
            <button
              type="button"
              className={`student-tab-btn ${activeTab === 'liked' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('liked')}
            >
              <Heart
                size={17}
                fill={activeTab === 'liked' ? 'currentColor' : 'none'}
                strokeWidth={2.2}
              />
              <span>Liked Houses</span>
              <span className="student-tab-counter">{savedHouses.length}</span>
            </button>

            <button
              type="button"
              className={`student-tab-btn ${activeTab === 'messages' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageSquare size={17} strokeWidth={2.2} />
              <span>Messages</span>
              <span className="student-tab-counter">{messages.length}</span>
            </button>
          </nav>

          {/* TAB 1: Liked Houses */}
          {activeTab === 'liked' && (
            <div>
              {loadingSaved ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading liked houses…
                </div>
              ) : savedHouses.length === 0 ? (
                <div className="student-empty-card">
                  <div className="student-empty-icon-wrap">
                    <Heart size={28} strokeWidth={2} />
                  </div>
                  <h3>No liked houses yet</h3>
                  <p>
                    Browse houses around KM, Wendani, and Sukari, then click the heart icon on any listing to save it here.
                  </p>
                  <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                    Browse Listings
                  </Link>
                </div>
              ) : (
                <div className="student-houses-grid">
                  {savedHouses.map(house => (
                    <HouseCard
                      key={house.id}
                      house={house}
                      isSaved={true}
                      onToggleSave={handleToggleSave}
                      onViewDetails={h => setSelectedHouseForDetails(h)}
                      onEnquire={h => setSelectedHouseForEnquiry(h)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Messages / Viewing Requests */}
          {activeTab === 'messages' && (
            <div>
              {loadingMessages ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading messages…
                </div>
              ) : messages.length === 0 ? (
                <div className="student-empty-card">
                  <div className="student-empty-icon-wrap">
                    <MessageSquare size={28} strokeWidth={2} />
                  </div>
                  <h3>No messages yet</h3>
                  <p>
                    When you send a viewing request or question to a caretaker, your conversation thread will appear here.
                  </p>
                  <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                    Find Houses
                  </Link>
                </div>
              ) : (
                <div
                  className="enquiry-chat-layout"
                  style={{
                    minHeight: '480px',
                    height: 'calc(100vh - 280px)',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                    display: 'flex',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Left List of Enquiries */}
                  <div
                    className="enquiry-list-panel"
                    style={{
                      width: '320px',
                      borderRight: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 800, fontSize: '0.92rem' }}>
                      Conversations ({messages.length})
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {messages.map(enq => {
                        const isSel = selectedEnquiry?.id === enq.id;
                        const lastMsg = enq.messages && enq.messages.length > 0
                          ? enq.messages[enq.messages.length - 1].text
                          : (enq.message || 'Viewing request');

                        return (
                          <div
                            key={enq.id}
                            onClick={() => setSelectedEnquiry(enq)}
                            style={{
                              padding: '14px 16px',
                              borderBottom: '1px solid var(--border-subtle)',
                              cursor: 'pointer',
                              background: isSel ? 'var(--primary-light)' : 'transparent',
                              borderLeft: isSel ? '3.5px solid var(--primary)' : '3.5px solid transparent',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '3px' }}>
                              {enq.houseTitle || enq.house_title || 'Keja Listing'}
                            </div>
                            <div style={{
                              color: 'var(--text-secondary)',
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginBottom: '6px'
                            }}>
                              {lastMsg}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {formatTime(enq.updatedAt || enq.updated_at || enq.createdAt || enq.created_at)}
                              </span>
                              <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '999px',
                                background: enq.status === 'replied' ? '#dcfce7' : '#fef3c7',
                                color: enq.status === 'replied' ? '#166534' : '#92400e'
                              }}>
                                {enq.status === 'replied' ? 'Replied' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Chat Panel */}
                  <div style={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', boxSizing: 'border-box' }}>
                    {selectedEnquiry ? (
                      <>
                        <div style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                              {selectedEnquiry.houseTitle || selectedEnquiry.house_title || 'Keja House Enquiry'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              Status: <strong>{selectedEnquiry.status === 'replied' ? 'Owner replied' : 'Awaiting owner reply'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Messages Scroll */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {selectedEnquiry.message && (!selectedEnquiry.messages || selectedEnquiry.messages.length === 0) && (
                            <div style={{
                              alignSelf: 'flex-end',
                              background: 'var(--primary-gradient)',
                              color: '#fff',
                              padding: '10px 14px',
                              borderRadius: '16px 16px 4px 16px',
                              maxWidth: '75%',
                              fontSize: '0.88rem'
                            }}>
                              {selectedEnquiry.message}
                            </div>
                          )}

                          {selectedEnquiry.messages?.map((msg, idx) => {
                            const isMe = msg.from === 'customer';
                            return (
                              <div
                                key={idx}
                                style={{
                                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                                  maxWidth: '75%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                              >
                                <div style={{
                                  background: isMe ? 'var(--primary-gradient)' : 'var(--bg-surface)',
                                  color: isMe ? '#fff' : 'var(--text-main)',
                                  padding: '10px 14px',
                                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                  fontSize: '0.88rem',
                                  border: isMe ? 'none' : '1px solid var(--border-subtle)',
                                  boxShadow: 'var(--shadow-xs)',
                                  lineHeight: 1.45
                                }}>
                                  {msg.text}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', padding: '0 4px' }}>
                                  {msg.senderName || (isMe ? 'You' : 'Owner')} • {formatTime(msg.at)}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Send Reply Bar */}
                        <form
                          onSubmit={handleSendReply}
                          style={{
                            padding: '12px 16px',
                            background: 'var(--bg-surface)',
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Type a message to the owner/caretaker…"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-full)',
                              border: '1.5px solid var(--border-subtle)',
                              fontSize: '0.9rem',
                              outline: 'none',
                              background: 'var(--bg-page)'
                            }}
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim() || sendingReply}
                            className="btn btn-primary"
                            style={{ borderRadius: 'var(--radius-full)', padding: '10px 18px', gap: '6px' }}
                          >
                            <Send size={15} /> Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Select a conversation to view messages.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* House Modals for Details and Booking from Liked tab */}
      {selectedHouseForDetails && (
        <HouseDetailsModal
          house={selectedHouseForDetails}
          onClose={() => setSelectedHouseForDetails(null)}
          onOpenEnquiry={(h) => setSelectedHouseForEnquiry(h)}
        />
      )}

      {selectedHouseForEnquiry && (
        <EnquiryModal
          house={selectedHouseForEnquiry}
          onClose={() => setSelectedHouseForEnquiry(null)}
          onSubmitSuccess={(msg) => {
            showToast(msg, 'info');
            fetchMessages();
          }}
        />
      )}

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
