'use client';

import { useState, useEffect } from 'react';
import { supabase, type Model } from '@/lib/supabase';
import Link from 'next/link';

const USE_CASES = ['coding', 'writing', 'image', 'voice'];
const PRICING_TYPES = ['free', 'freemium', 'paid'];
const SORT_OPTIONS = [
  { label: 'Rating', value: 'rating' },
  { label: 'Newest', value: 'newest' },
  { label: 'Name', value: 'name' },
];

function pricingBadgeColor(type: string) {
  switch (type) {
    case 'free': return { background: '#dcfce7', color: '#166534' };
    case 'freemium': return { background: '#fef9c3', color: '#854d0e' };
    case 'paid': return { background: '#f3f4f6', color: '#374151' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [search, setSearch] = useState('');
  const [useCaseFilter, setUseCaseFilter] = useState('');
  const [pricingFilter, setPricingFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      setLoading(true);
      let query = supabase.from('models').select('*, companies(*)');

      if (useCaseFilter) {
        query = query.contains('use_cases', [useCaseFilter]);
      }
      if (pricingFilter) {
        query = query.eq('pricing_type', pricingFilter);
      }

      if (sortBy === 'rating') {
        query = query.order('benchmark_score', { ascending: false });
      } else if (sortBy === 'newest') {
        query = query.order('launched_at', { ascending: false });
      } else if (sortBy === 'name') {
        query = query.order('name', { ascending: true });
      }

      const { data } = await query;
      let result = data || [];

      if (search) {
        const s = search.toLowerCase();
        result = result.filter((m: any) =>
          m.name.toLowerCase().includes(s) ||
          (m.description && m.description.toLowerCase().includes(s)) ||
          (m.companies?.name && m.companies.name.toLowerCase().includes(s))
        );
      }

      setModels(result);
      setLoading(false);
    }
    fetchModels();
  }, [search, useCaseFilter, pricingFilter, sortBy]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '32px 0 24px' }}>All AI Models</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            fontSize: 14,
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            minWidth: 220,
            outline: 'none',
          }}
        />
        <select
          value={useCaseFilter}
          onChange={(e) => setUseCaseFilter(e.target.value)}
          style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}
        >
          <option value="">All use cases</option>
          {USE_CASES.map((uc) => (
            <option key={uc} value={uc}>{uc}</option>
          ))}
        </select>
        <select
          value={pricingFilter}
          onChange={(e) => setPricingFilter(e.target.value)}
          style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}
        >
          <option value="">All pricing</option>
          {PRICING_TYPES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {models.map((model: any) => {
            const badge = pricingBadgeColor(model.pricing_type);
            return (
              <Link
                key={model.id}
                href={`/models/${model.id}`}
                style={{
                  display: 'block',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 16,
                  background: '#fff',
                  textDecoration: 'none',
                  color: '#1a1a1a',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{model.name}</h3>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: badge.background, color: badge.color }}>
                    {model.pricing_type}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 8px' }}>
                  {model.companies?.name || 'Unknown'}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {model.use_cases?.map((uc: string) => (
                    <span key={uc} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f3f4f6', color: '#374151' }}>
                      {uc}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280' }}>
                  {model.benchmark_score && (
                    <span>Score: <strong style={{ color: '#1877F2' }}>{model.benchmark_score}</strong></span>
                  )}
                  {model.context_window && (
                    <span>Context: {model.context_window}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && models.length === 0 && (
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', padding: '48px 0' }}>No models found.</p>
      )}
    </div>
  );
}
