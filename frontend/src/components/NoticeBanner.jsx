import React from 'react';

export default function NoticeBanner() {
  return (
    <div className="notice-banner" style={{ marginTop: '32px' }}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <div>
        <strong>Student Safety Reminder:</strong> Never pay viewing fees
        (&quot;pesa ya kuona nyumba&quot;) or deposit via M-Pesa to unverified brokers
        before seeing the room in person and meeting the authorized caretaker.
      </div>
    </div>
  );
}
