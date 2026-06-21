import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SubscribeWidget from '@/components/SubscribeWidget';

async function getTopNews() {
  const { data } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(6);
  return data || [];
}

async function getTopModels() {
  const { data } = await supabase
    .from('models')
    .select('*, companies(*)')
    .order('benchmark_score', { ascending: false })
    .limit(4);
  return data || [];
}

async function getNewLaunches() {
  const { data } = await supabase
    .from('models')
    .select('*, companies(*)')
    .order('launched_at', { ascending: false })
    .limit(3);
  return data || [];
}

function categoryBadgeColor(category: string) {
  switch (category) {
    case 'funding': return { background: '#dbeafe', color: '#1e40af' };
    case 'india': return { background: '#dcfce7', color: '#166534' };
    case 'research': return { background: '#f3e8ff', color: '#7e22ce' };
    case 'policy': return { background: '#ffedd5', color: '#c2410c' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
}

function pricingBadgeColor(type: string) {
  switch (type) {
    case 'free': return { background: '#dcfce7', color: '#166534' };
    case 'freemium': return { background: '#fef9c3', color: '#854d0e' };
    case 'paid': return { background: '#f3f4f6', color: '#374151' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
}

export default async function Home() {
  const [news, topModels, newLaunches] = await Promise.all([
    getTopNews(),
    getTopModels(),
    getNewLaunches(),
  ]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* Hero */}
      <section style={{ padding: '64px 0 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px', color: '#1a1a1a' }}>
          Everything AI. One place.
        </h1>
        <p style={{ fontSize: 16, color: '#6b7280', margin: 0, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
          Daily AI news, model comparisons, and company updates — made for India.
        </p>
      </section>

      {/* Top News */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Today&apos;s top AI news</h2>
          <Link href="/news" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {news.map((item) => {
            const badge = categoryBadgeColor(item.category);
            return (
              <a
                key={item.id}
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: badge.background, color: badge.color }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{item.source_name}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', lineHeight: 1.4 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.summary}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Top Models */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Top rated AI models</h2>
          <Link href="/models" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {topModels.map((model) => {
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
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {model.use_cases?.map((uc: string) => (
                    <span key={uc} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f3f4f6', color: '#374151' }}>
                      {uc}
                    </span>
                  ))}
                </div>
                {model.benchmark_score && (
                  <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: '#1877F2' }}>
                    Score: {model.benchmark_score}/100
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* New Launches */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>New model launches</h2>
          <Link href="/models" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {newLaunches.map((model) => {
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
                  {model.companies?.name || 'Unknown'} · {model.launched_at ? new Date(model.launched_at).toLocaleDateString() : 'N/A'}
                </p>
                <p style={{ fontSize: 14, color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{model.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Subscribe Widget */}
      <section style={{ marginBottom: 48 }}>
        <SubscribeWidget />
      </section>
    </div>
  );
}
