import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const CATEGORIES = ['All', 'Funding', 'Model Launch', 'Research', 'India', 'Policy'];

async function getNews(category?: string) {
  let query = supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false });

  if (category && category !== 'All') {
    const dbCategory = category.toLowerCase().replace(' ', '-');
    query = query.eq('category', dbCategory);
  }

  const { data } = await query;
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

export default async function NewsPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category || 'All';
  const news = await getNews(category);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '32px 0 24px' }}>AI News</h1>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => {
          const isActive = cat === category;
          return (
            <Link
              key={cat}
              href={cat === 'All' ? '/news' : `/news?category=${encodeURIComponent(cat)}`}
              style={{
                fontSize: 14,
                padding: '6px 14px',
                borderRadius: 4,
                textDecoration: 'none',
                background: isActive ? '#1877F2' : '#f3f4f6',
                color: isActive ? '#fff' : '#374151',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* News grid */}
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
              <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.summary}
              </p>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}
              </span>
            </a>
          );
        })}
      </div>

      {news.length === 0 && (
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', padding: '48px 0' }}>No news articles found.</p>
      )}
    </div>
  );
}
