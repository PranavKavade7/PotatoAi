'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Deal = {
  id: string;
  tool_name: string;
  company: string | null;
  deal_title: string;
  deal_description: string | null;
  original_price: string | null;
  deal_price: string | null;
  discount_percent: number | null;
  deal_type: string | null;
  deal_url: string | null;
  valid_until: string | null;
  is_verified: boolean;
  is_featured: boolean;
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'free_trial', label: 'Free Trials' },
  { key: 'student', label: 'Student Offers' },
  { key: 'india_price', label: 'India Pricing' },
  { key: 'lifetime', label: 'Lifetime Deals' },
  { key: 'discount', label: 'Discounts' },
  { key: 'free_tier', label: 'Free Tiers' },
];

function dealTypeBadge(type: string) {
  switch (type) {
    case 'free_trial': return { bg: '#dcfce7', text: '#166534' };
    case 'student': return { bg: '#f3e8ff', text: '#7e22ce' };
    case 'india_price': return { bg: '#ffedd5', text: '#c2410c' };
    case 'lifetime': return { bg: '#ccfbf1', text: '#0f766e' };
    case 'discount': return { bg: '#fee2e2', text: '#991b1b' };
    case 'free_tier': return { bg: '#dcfce7', text: '#166534' };
    default: return { bg: '#f3f4f6', text: '#374151' };
  }
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, freeTrials: 0, india: 0 });

  const [submitName, setSubmitName] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitDesc, setSubmitDesc] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    async function fetchDeals() {
      const { data } = await supabase.from('deals').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      const list = (data || []) as Deal[];
      setDeals(list);
      setStats({
        total: list.length,
        freeTrials: list.filter((d) => d.deal_type === 'free_trial').length,
        india: list.filter((d) => d.deal_type === 'india_price').length,
      });
      setLoading(false);
    }
    fetchDeals();
  }, []);

  const filtered = activeFilter === 'all' ? deals : deals.filter((d) => d.deal_type === activeFilter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submitName.trim()) return;
    setSubmitStatus('loading');
    try {
      const res = await fetch('/api/submit-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_name: submitName, deal_url: submitUrl, deal_description: submitDesc }),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setSubmitMsg('Thanks! Your deal is under review.');
        setSubmitName('');
        setSubmitUrl('');
        setSubmitDesc('');
      } else {
        setSubmitStatus('error');
        setSubmitMsg('Something went wrong. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMsg('Something went wrong. Please try again.');
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '32px 0 4px' }}>AI Deals and Discounts</h1>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>Verified offers, free trials, and India pricing for AI tools</p>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1877F2' }}>{stats.total}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Active Deals</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1877F2' }}>{stats.freeTrials}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Free Trials</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1877F2' }}>{stats.india}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>India Offers</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {FILTERS.map((f) => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid #1877F2',
                background: active ? '#1877F2' : '#fff',
                color: active ? '#fff' : '#1877F2',
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Deal Cards */}
      {loading ? (
        <p style={{ fontSize: 14, color: '#6b7280' }}>Loading deals...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 48 }}>
          {filtered.map((deal) => {
            const badge = dealTypeBadge(deal.deal_type || '');
            const isFree = deal.deal_type === 'free_trial' || deal.deal_type === 'free_tier';
            return (
              <div
                key={deal.id}
                style={{
                  border: deal.is_featured ? '2px solid #1877F2' : '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 16,
                  background: '#fff',
                  position: 'relative',
                }}
              >
                {deal.is_featured && (
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 4,
                    background: '#1877F2',
                    color: '#fff',
                  }}>
                    Featured
                  </span>
                )}
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{deal.tool_name}</div>
                {deal.company && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{deal.company}</div>}
                <div style={{ fontSize: 14, color: '#1a1a1a', marginTop: 8, fontWeight: 500 }}>{deal.deal_title}</div>
                {deal.deal_description && (
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {deal.deal_description}
                  </div>
                )}

                {/* Price row */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {isFree ? (
                    <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: '#dcfce7', color: '#166534' }}>FREE</span>
                  ) : (
                    <>
                      {deal.original_price && (
                        <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>{deal.original_price}</span>
                      )}
                      {deal.deal_price && (
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1877F2' }}>{deal.deal_price}</span>
                      )}
                    </>
                  )}
                  {deal.discount_percent && (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#1877F2', color: '#fff' }}>
                      {deal.discount_percent}% OFF
                    </span>
                  )}
                </div>

                {/* Meta row */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 4, background: badge.bg, color: badge.text, textTransform: 'capitalize' }}>
                    {(deal.deal_type || '').replace('_', ' ')}
                  </span>
                  {deal.is_verified && (
                    <span style={{ fontSize: 12, color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>✓</span> Verified
                    </span>
                  )}
                </div>

                {/* Expiry */}
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                  {deal.valid_until ? `Expires ${new Date(deal.valid_until).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No expiry'}
                </div>

                {/* CTA */}
                {deal.deal_url && (
                  <a
                    href={deal.deal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      marginTop: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      padding: '10px 0',
                      borderRadius: 6,
                      background: '#1877F2',
                      color: '#fff',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#1565D8'; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#1877F2'; }}
                  >
                    Get Deal →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 48 }}>No deals found for this filter.</p>
      )}

      {/* Submit a Deal */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, maxWidth: 500, marginBottom: 48 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Found a deal we missed?</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Submit it and we'll review it.</p>
        {submitStatus === 'success' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontSize: 14, fontWeight: 600 }}>
            <span style={{ fontSize: 18 }}>✓</span>
            {submitMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              required
              placeholder="Tool name"
              value={submitName}
              onChange={(e) => setSubmitName(e.target.value)}
              style={{ fontSize: 14, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}
            />
            <input
              type="url"
              placeholder="Deal URL"
              value={submitUrl}
              onChange={(e) => setSubmitUrl(e.target.value)}
              style={{ fontSize: 14, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}
            />
            <textarea
              placeholder="Deal description"
              value={submitDesc}
              onChange={(e) => setSubmitDesc(e.target.value)}
              rows={3}
              style={{ fontSize: 14, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none', resize: 'vertical' }}
            />
            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              style={{
                fontSize: 14,
                fontWeight: 600,
                padding: '10px 20px',
                borderRadius: 4,
                border: '1px solid #1877F2',
                background: '#fff',
                color: '#1877F2',
                cursor: submitStatus === 'loading' ? 'not-allowed' : 'pointer',
                opacity: submitStatus === 'loading' ? 0.7 : 1,
              }}
            >
              {submitStatus === 'loading' ? 'Submitting...' : 'Submit Deal'}
            </button>
            {submitStatus === 'error' && (
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{submitMsg}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
