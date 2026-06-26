'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubscribeWidget from '@/components/SubscribeWidget';
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

type Model = {
  id: string;
  name: string;
  description: string;
  use_cases: string[];
  pricing_type: string;
  context_window: string;
  benchmark_score: number;
  launched_at: string;
  companies: { name: string } | null;
};

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  'model-launch': { label: 'Model Launch', color: '#1e40af', bg: '#dbeafe', dot: '#2563eb' },
  'funding': { label: 'Funding', color: '#166534', bg: '#dcfce7', dot: '#16a34a' },
  'research': { label: 'Research', color: '#0f766e', bg: '#ccfbf1', dot: '#0d9488' },
  'india': { label: 'India', color: '#c2410c', bg: '#ffedd5', dot: '#ea580c' },
  'policy': { label: 'Policy', color: '#9a3412', bg: '#fef3c7', dot: '#d97706' },
};

function pricingBadgeColor(type: string) {
  switch (type) {
    case 'free': return { background: '#dcfce7', color: '#166534' };
    case 'freemium': return { background: '#fef9c3', color: '#854d0e' };
    case 'paid': return { background: '#f3f4f6', color: '#374151' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [topModels, setTopModels] = useState<Model[]>([]);
  const [newLaunches, setNewLaunches] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [{ data: newsData }, { data: modelsData }, { data: launchesData }] = await Promise.all([
        supabase.from('news').select('*').order('published_at', { ascending: false }).limit(20),
        supabase.from('models').select('*, companies(*)').order('benchmark_score', { ascending: false }).limit(4),
        supabase.from('models').select('*, companies(*)').order('launched_at', { ascending: false }).limit(3),
      ]);
      setNews(newsData || []);
      setTopModels(modelsData || []);
      setNewLaunches(launchesData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const featured = news.find((n) => n.is_featured) || news[0];
  const secondaryNews = news.filter((n) => n.id !== featured?.id).slice(0, 4);
  const indiaNews = news.filter((n) => n.category === 'india').slice(0, 3);
  const fundingNews = news.filter((n) => n.category === 'funding').slice(0, 3);
  const researchNews = news.filter((n) => n.category === 'research').slice(0, 3);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* Hero */}
      <section style={{ margin: '32px 0 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1877F2', background: '#E7F0FD', padding: '4px 12px', borderRadius: 20 }}>
            India's AI Intelligence Platform
          </span>
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 700, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Track every AI model, company, and story — <span style={{ color: '#1877F2' }}>made for India</span>
        </h1>
        <p style={{ fontSize: 18, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5, maxWidth: 640 }}>
          Daily AI news, model benchmarks, company profiles, and verified deals — all in one place. Built for builders, researchers, and curious minds.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/news"
            style={{
              fontSize: 15, fontWeight: 600, padding: '12px 24px', borderRadius: 8,
              background: '#1877F2', color: '#fff', textDecoration: 'none', display: 'inline-block',
            }}
          >
            Read the latest news
          </Link>
          <Link
            href="/compare"
            style={{
              fontSize: 15, fontWeight: 600, padding: '12px 24px', borderRadius: 8,
              border: '1px solid #e5e7eb', color: '#1a1a1a', textDecoration: 'none', display: 'inline-block',
            }}
          >
            Compare models
          </Link>
        </div>
      </section>

      {/* Featured + Secondary News */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Today&apos;s top AI news</h2>
          <Link href="/news" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: '#fff', minHeight: 200 }}>
                <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 12, width: '40%' }} />
                <div style={{ height: 16, background: '#f3f4f6', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 16, background: '#f3f4f6', borderRadius: 4, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
            {/* Featured story */}
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
                    {CATEGORY_META[featured.category] && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: CATEGORY_META[featured.category].color }}>
                        {CATEGORY_META[featured.category].label}
                      </span>
                    )}
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

            {/* Secondary stories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {secondaryNews.map((item) => {
                const cat = CATEGORY_META[item.category] || { label: item.category, color: '#374151', bg: '#f3f4f6', dot: '#9ca3af' };
                return (
                  <a
                    key={item.id}
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16,
                      background: '#fff', textDecoration: 'none', color: '#1a1a1a', flex: 1,
                    }}
                    className="news-card"
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
        )}
      </section>

      {/* India News Section */}
      {indiaNews.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c' }} />
              <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>India AI</h2>
              <span style={{ fontSize: 13, color: '#9ca3af' }}>· stories from and for India</span>
            </div>
            <Link href="/news?category=India" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none', fontWeight: 500 }}>More India news →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {indiaNews.map((item) => (
              <a
                key={item.id}
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', border: '1px solid #e5e7eb', borderRadius: 10, padding: 18,
                  background: '#fff', textDecoration: 'none', color: '#1a1a1a',
                  borderLeft: '3px solid #ea580c',
                }}
                className="news-card"
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', lineHeight: 1.4 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.summary}
                </p>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.source_name} · {timeAgo(item.published_at)}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Top Models */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Top rated AI models</h2>
          <Link href="/models" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
        </div>
        {loading ? (
          <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {topModels.map((model, idx) => {
              const badge = pricingBadgeColor(model.pricing_type);
              return (
                <Link
                  key={model.id}
                  href={`/models/${model.id}`}
                  style={{
                    display: 'block', border: '1px solid #e5e7eb', borderRadius: 10, padding: 18,
                    background: '#fff', textDecoration: 'none', color: '#1a1a1a', position: 'relative',
                  }}
                  className="model-card"
                >
                  {idx < 3 && (
                    <span style={{
                      position: 'absolute', top: -8, left: 18, fontSize: 11, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 4, background: '#1877F2', color: '#fff',
                    }}>
                      #{idx + 1}
                    </span>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{model.name}</h3>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: badge.background, color: badge.color }}>
                      {model.pricing_type}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 10px' }}>
                    {model.companies?.name || 'Unknown'}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {model.use_cases?.map((uc: string) => (
                      <span key={uc} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f3f4f6', color: '#374151' }}>
                        {uc}
                      </span>
                    ))}
                  </div>
                  {model.benchmark_score && (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                        <span>Benchmark</span>
                        <span style={{ fontWeight: 700, color: '#1877F2' }}>{model.benchmark_score}/100</span>
                      </div>
                      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${model.benchmark_score}%`, height: '100%', background: '#1877F2', borderRadius: 3 }} />
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Funding + Research two-column */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Funding */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }} />
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Funding</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fundingNews.map((item) => (
                <a
                  key={item.id}
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14,
                    background: '#fff', textDecoration: 'none', color: '#1a1a1a',
                  }}
                  className="news-card"
                >
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', lineHeight: 1.4 }}>{item.title}</h3>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.source_name} · {timeAgo(item.published_at)}</div>
                </a>
              ))}
            </div>
          </div>
          {/* Research */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0d9488' }} />
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Research</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {researchNews.map((item) => (
                <a
                  key={item.id}
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14,
                    background: '#fff', textDecoration: 'none', color: '#1a1a1a',
                  }}
                  className="news-card"
                >
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', lineHeight: 1.4 }}>{item.title}</h3>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.source_name} · {timeAgo(item.published_at)}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Launches */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>New model launches</h2>
          <Link href="/models" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
        </div>
        {loading ? (
          <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {newLaunches.map((model) => {
              const badge = pricingBadgeColor(model.pricing_type);
              return (
                <Link
                  key={model.id}
                  href={`/models/${model.id}`}
                  style={{
                    display: 'block', border: '1px solid #e5e7eb', borderRadius: 10, padding: 18,
                    background: '#fff', textDecoration: 'none', color: '#1a1a1a',
                  }}
                  className="model-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{model.name}</h3>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: badge.background, color: badge.color }}>
                      {model.pricing_type}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 8px' }}>
                    {model.companies?.name || 'Unknown'} · {model.launched_at ? new Date(model.launched_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                  <p style={{ fontSize: 14, color: '#4b5563', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{model.description}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Subscribe Widget */}
      <section style={{ marginBottom: 48 }}>
        <SubscribeWidget />
      </section>
    </div>
  );
}
