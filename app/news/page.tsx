'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  published_at: string;
  is_featured: boolean;
};

const CATEGORIES = [
  { key: 'All', label: 'All', color: '#374151', dot: '#6b7280' },
  { key: 'Model Launch', label: 'Model Launch', color: '#1e40af', dot: '#2563eb' },
  { key: 'Funding', label: 'Funding', color: '#166534', dot: '#16a34a' },
  { key: 'Research', label: 'Research', color: '#0f766e', dot: '#0d9488' },
  { key: 'India', label: 'India', color: '#c2410c', dot: '#ea580c' },
  { key: 'Policy', label: 'Policy', color: '#9a3412', dot: '#d97706' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function categoryMeta(category: string) {
  const map: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    'model-launch': { label: 'Model Launch', color: '#1e40af', bg: '#dbeafe', dot: '#2563eb' },
    'funding': { label: 'Funding', color: '#166534', bg: '#dcfce7', dot: '#16a34a' },
    'research': { label: 'Research', color: '#0f766e', bg: '#ccfbf1', dot: '#0d9488' },
    'india': { label: 'India', color: '#c2410c', bg: '#ffedd5', dot: '#ea580c' },
    'policy': { label: 'Policy', color: '#9a3412', bg: '#fef3c7', dot: '#d97706' },
  };
  return map[category] || { label: category, color: '#374151', bg: '#f3f4f6', dot: '#9ca3af' };
}

export default function NewsPage() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false });
      setAllNews(data || []);
      setLoading(false);
    }
    fetchNews();
  }, []);

  const filtered = useMemo(() => {
    let result = allNews;
    if (category !== 'All') {
      const dbCategory = category.toLowerCase().replace(' ', '-');
      result = result.filter((n) => n.category === dbCategory);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((n) =>
        n.title.toLowerCase().includes(s) ||
        (n.summary && n.summary.toLowerCase().includes(s)) ||
        (n.source_name && n.source_name.toLowerCase().includes(s))
      );
    }
    if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
    }
    return result;
  }, [allNews, category, search, sortBy]);

  const featured = filtered.find((n) => n.is_featured) || filtered[0];
  const rest = featured ? filtered.filter((n) => n.id !== featured.id) : [];
  const showFeaturedLayout = category === 'All' && !search && filtered.length > 4;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ margin: '32px 0 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.01em' }}>AI News</h1>
        <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
          {loading ? 'Loading...' : `${filtered.length} stor${filtered.length === 1 ? 'y' : 'ies'}${category !== 'All' ? ` in ${category}` : ''}`}
        </p>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search news by title, source, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', fontSize: 14, padding: '12px 16px',
            border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const isActive = cat.key === category;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                style={{
                  fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 20,
                  border: isActive ? '1px solid #1877F2' : '1px solid #e5e7eb',
                  background: isActive ? '#1877F2' : '#fff',
                  color: isActive ? '#fff' : '#374151',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {!isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.dot }} />}
                {cat.label}
              </button>
            );
          })}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none', background: '#fff' }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 18, background: '#fff' }}>
              <div style={{ height: 10, background: '#f3f4f6', borderRadius: 4, marginBottom: 12, width: '30%' }} />
              <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4, width: '70%', marginBottom: 12 }} />
              <div style={{ height: 10, background: '#f3f4f6', borderRadius: 4, width: '40%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <p style={{ fontSize: 16, color: '#6b7280', margin: '0 0 8px' }}>No articles found</p>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 16px' }}>Try a different category or search term.</p>
          <button
            onClick={() => { setCategory('All'); setSearch(''); }}
            style={{
              fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
              border: '1px solid #1877F2', background: '#fff', color: '#1877F2', cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        </div>
      ) : showFeaturedLayout ? (
        <>
          {/* Featured + grid layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16, marginBottom: 24 }}>
            {featured && (
              <a
                href={featured.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card"
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  border: '1px solid #e5e7eb', borderRadius: 12, padding: 28,
                  background: 'linear-gradient(135deg, #E7F0FD 0%, #fff 100%)',
                  textDecoration: 'none', color: '#1a1a1a', minHeight: 280,
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4, background: '#1877F2', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Featured
                    </span>
                    {(() => {
                      const cat = categoryMeta(featured.category);
                      return <span style={{ fontSize: 12, fontWeight: 600, color: cat.color }}>{cat.label}</span>;
                    })()}
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                    {featured.title}
                  </h3>
                  <p style={{ fontSize: 15, color: '#4b5563', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {featured.summary}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, fontSize: 13, color: '#6b7280' }}>
                  <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{featured.source_name}</span>
                  <span>·</span>
                  <span>{timeAgo(featured.published_at)}</span>
                </div>
              </a>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rest.slice(0, 4).map((item) => {
                const cat = categoryMeta(item.category);
                return (
                  <a
                    key={item.id}
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-card"
                    style={{
                      display: 'block', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16,
                      background: '#fff', textDecoration: 'none', color: '#1a1a1a', flex: 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.dot }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {cat.label}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </h4>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {item.source_name} · {timeAgo(item.published_at)}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Remaining grid */}
          {rest.length > 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {rest.slice(4).map((item) => {
                const cat = categoryMeta(item.category);
                return (
                  <a
                    key={item.id}
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-card"
                    style={{
                      display: 'block', border: '1px solid #e5e7eb', borderRadius: 10, padding: 18,
                      background: '#fff', textDecoration: 'none', color: '#1a1a1a',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.dot }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {cat.label}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', lineHeight: 1.4 }}>{item.title}</h3>
                    <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.summary}
                    </p>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {item.source_name} · {timeAgo(item.published_at)}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Simple grid when filtered */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map((item) => {
            const cat = categoryMeta(item.category);
            return (
              <a
                key={item.id}
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card"
                style={{
                  display: 'block', border: '1px solid #e5e7eb', borderRadius: 10, padding: 18,
                  background: '#fff', textDecoration: 'none', color: '#1a1a1a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.dot }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {cat.label}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', lineHeight: 1.4 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.summary}
                </p>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  {item.source_name} · {timeAgo(item.published_at)}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
