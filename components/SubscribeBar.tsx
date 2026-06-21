'use client';

import { useState } from 'react';

export default function SubscribeBar() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage("You're in! Check your inbox.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong.');
    }
  }

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', background: '#E7F0FD', padding: '20px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Get AI news every Monday</span>
          <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>Free. No spam.</span>
        </div>
        {status === 'success' ? (
          <span style={{ fontSize: 14, color: '#166534', fontWeight: 600 }}>✓ {message}</span>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none', minWidth: 200 }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 4,
                background: '#1877F2',
                color: '#fff',
                border: 'none',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (status !== 'loading') (e.target as HTMLButtonElement).style.background = '#1565D8'; }}
              onMouseLeave={(e) => { if (status !== 'loading') (e.target as HTMLButtonElement).style.background = '#1877F2'; }}
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
            {status === 'error' && (
              <span style={{ fontSize: 13, color: '#dc2626' }}>{message}</span>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
