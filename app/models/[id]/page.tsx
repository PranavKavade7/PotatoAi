import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getModel(id: string) {
  const { data } = await supabase
    .from('models')
    .select('*, companies(*)')
    .eq('id', id)
    .maybeSingle();
  return data;
}

async function getRatings(modelId: string) {
  const { data } = await supabase
    .from('ratings')
    .select('*')
    .eq('model_id', modelId);
  return data || [];
}

function pricingBadgeColor(type: string) {
  switch (type) {
    case 'free': return { background: '#dcfce7', color: '#166534' };
    case 'freemium': return { background: '#fef9c3', color: '#854d0e' };
    case 'paid': return { background: '#f3f4f6', color: '#374151' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ color: i <= fullStars ? '#fbbf24' : i === fullStars + 1 && hasHalf ? '#fbbf24' : '#e5e7eb', fontSize: 18 }}>
            ★
          </span>
        ))}
      </div>
      <span style={{ fontSize: 14, color: '#6b7280' }}>{rating.toFixed(1)} ({count} ratings)</span>
    </div>
  );
}

export default async function ModelDetail({ params }: { params: { id: string } }) {
  const model = await getModel(params.id);
  if (!model) notFound();

  const ratings = await getRatings(params.id);
  const avgRating = ratings.length > 0 ? ratings.reduce((a, r) => a + r.rating, 0) / ratings.length : 0;

  const badge = pricingBadgeColor(model.pricing_type);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ margin: '32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{model.name}</h1>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 4, background: badge.background, color: badge.color }}>
            {model.pricing_type}
          </span>
        </div>
        <p style={{ fontSize: 16, color: '#6b7280', margin: 0 }}>
          {model.companies?.name || 'Unknown'} · Launched {model.launched_at ? new Date(model.launched_at).toLocaleDateString() : 'N/A'}
        </p>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 32, background: '#fff' }}>
        <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 24px' }}>{model.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Pricing</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{model.pricing_detail || model.pricing_type}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Context Window</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{model.context_window || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Benchmark</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1877F2' }}>{model.benchmark_score || 'N/A'}/100</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Community Rating</div>
            <StarRating rating={avgRating} count={ratings.length} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {model.use_cases?.map((uc: string) => (
            <span key={uc} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, background: '#f3f4f6', color: '#374151' }}>
              {uc}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        {model.official_url && (
          <a
            href={model.official_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: '10px 20px',
              borderRadius: 4,
              background: '#1877F2',
              color: '#fff',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Official Website →
          </a>
        )}
        <Link
          href="/compare"
          style={{
            fontSize: 14,
            fontWeight: 600,
            padding: '10px 20px',
            borderRadius: 4,
            border: '1px solid #e5e7eb',
            color: '#1a1a1a',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Compare with another model
        </Link>
      </div>
    </div>
  );
}
