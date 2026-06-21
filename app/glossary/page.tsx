'use client';

import { useState, useEffect } from 'react';
import { supabase, type GlossaryTerm } from '@/lib/supabase';

const CATEGORIES = ['All', 'Basics', 'Technical', 'Business'];

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTerms() {
      setLoading(true);
      let query = supabase.from('glossary').select('*').order('term');
      if (category !== 'All') {
        query = query.eq('category', category.toLowerCase());
      }
      const { data } = await query;
      let result = data || [];
      if (search) {
        const s = search.toLowerCase();
        result = result.filter((t) =>
          t.term.toLowerCase().includes(s) ||
          t.definition.toLowerCase().includes(s)
        );
      }
      setTerms(result);
      setLoading(false);
    }
    fetchTerms();
  }, [search, category]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '32px 0 24px' }}>AI Glossary</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            fontSize: 14,
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            minWidth: 240,
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {CATEGORIES.map((cat) => {
            const isActive = cat === category;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  fontSize: 14,
                  padding: '6px 14px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#1877F2' : '#f3f4f6',
                  color: isActive ? '#fff' : '#374151',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {terms.map((term) => (
            <div
              key={term.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{term.term}</h3>
                {term.category && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f3f4f6', color: '#374151', textTransform: 'capitalize' }}>
                    {term.category}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 6px', color: '#1a1a1a' }}>{term.definition}</p>
              {term.example && (
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0, fontStyle: 'italic' }}>
                  &ldquo;{term.example}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && terms.length === 0 && (
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', padding: '48px 0' }}>No terms found.</p>
      )}
    </div>
  );
}
