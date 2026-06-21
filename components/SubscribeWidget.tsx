'use client';

import { useState } from 'react';

export default function SubscribeWidget() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
        body: JSON.stringify({ email, name: name || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage("You're in! Check your inbox.");
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, background: '#fff', maxWidth: 600, margin: '0 auto' }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>Get AI news in your inbox every Monday</h3>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 16px' }}>Join 1,000+ readers. Free. No spam.</p>

      {status === 'success' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontSize: 14, fontWeight: 600 }}>
          <span style={{ fontSize: 18 }}>✓</span>
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1, minWidth: 180, fontSize: 14, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}
            />
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flex: 1, minWidth: 180, fontSize: 14, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                fontSize: 14,
                fontWeight: 600,
                padding: '10px 20px',
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
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          {status === 'error' && (
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
