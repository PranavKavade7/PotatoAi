'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, type Model } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';

const PRICING_ORDER: Record<string, number> = { free: 0, freemium: 1, paid: 2 };

function pricingBadge(type: string) {
  switch (type) {
    case 'free': return { bg: '#dcfce7', text: '#166534' };
    case 'freemium': return { bg: '#fef9c3', text: '#854d0e' };
    case 'paid': return { bg: '#f3f4f6', text: '#374151' };
    default: return { bg: '#f3f4f6', text: '#374151' };
  }
}

function StarRating({ score }: { score: number }) {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: 16, color: i <= full ? '#1877F2' : i === full + 1 && half ? '#1877F2' : '#e5e7eb' }}>
          ★
        </span>
      ))}
      <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>{score.toFixed(1)}</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#1877F2', minWidth: 36 }}>{score}</span>
      <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#1877F2', borderRadius: 4 }} />
      </div>
    </div>
  );
}

const POPULAR = [
  { label: 'GPT-4o vs Claude 3.5 Sonnet', a: 'GPT-4o', b: 'Claude 3.5 Sonnet' },
  { label: 'Gemini 1.5 Pro vs GPT-4o', a: 'Gemini 1.5 Pro', b: 'GPT-4o' },
  { label: 'Claude 3.5 Sonnet vs Gemini 1.5 Pro', a: 'Claude 3.5 Sonnet', b: 'Gemini 1.5 Pro' },
  { label: 'GPT-4o mini vs Claude 3 Haiku', a: 'GPT-4o mini', b: 'Claude 3 Haiku' },
  { label: 'Llama 3.1 70B vs Mistral Large', a: 'Llama 3.1 70B', b: 'Mistral Large' },
  { label: 'Gemini Flash vs GPT-4o mini', a: 'Gemini Flash', b: 'GPT-4o mini' },
];

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [models, setModels] = useState<Model[]>([]);
  const [modelA, setModelA] = useState<Model | null>(null);
  const [modelB, setModelB] = useState<Model | null>(null);
  const [ratingsA, setRatingsA] = useState(0);
  const [ratingsB, setRatingsB] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchRatings = useCallback(async (modelId: string, setFn: (n: number) => void) => {
    const { data } = await supabase.from('ratings').select('rating').eq('model_id', modelId);
    const list = data || [];
    if (list.length > 0) {
      setFn(list.reduce((s, r) => s + r.rating, 0) / list.length);
    } else {
      setFn(0);
    }
  }, []);

  useEffect(() => {
    async function fetchModels() {
      const { data } = await supabase.from('models').select('*, companies(*)').order('name');
      const list = (data || []) as Model[];
      setModels(list);
      setLoading(false);

      const aId = searchParams.get('modelA');
      const bId = searchParams.get('modelB');
      if (aId) {
        const a = list.find((m) => m.id === aId) || null;
        setModelA(a);
        if (a) fetchRatings(a.id, setRatingsA);
      }
      if (bId) {
        const b = list.find((m) => m.id === bId) || null;
        setModelB(b);
        if (b) fetchRatings(b.id, setRatingsB);
      }
    }
    fetchModels();
  }, [searchParams, fetchRatings]);

  function selectModelA(id: string) {
    const m = models.find((x) => x.id === id) || null;
    setModelA(m);
    if (m) fetchRatings(m.id, setRatingsA);
  }

  function selectModelB(id: string) {
    const m = models.find((x) => x.id === id) || null;
    setModelB(m);
    if (m) fetchRatings(m.id, setRatingsB);
  }

  function handleCompare() {
    if (!modelA || !modelB) return;
    const params = new URLSearchParams();
    params.set('modelA', modelA.id);
    params.set('modelB', modelB.id);
    router.push(`/compare?${params.toString()}`);
  }

  function handleShare() {
    if (!modelA || !modelB) return;
    const params = new URLSearchParams();
    params.set('modelA', modelA.id);
    params.set('modelB', modelB.id);
    const url = `${window.location.origin}/compare?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function loadPopular(aName: string, bName: string) {
    const a = models.find((m) => m.name === aName) || null;
    const b = models.find((m) => m.name === bName) || null;
    setModelA(a);
    setModelB(b);
    if (a) fetchRatings(a.id, setRatingsA);
    if (b) fetchRatings(b.id, setRatingsB);
    if (a && b) {
      const params = new URLSearchParams();
      params.set('modelA', a.id);
      params.set('modelB', b.id);
      router.push(`/compare?${params.toString()}`);
    }
  }

  const a = modelA;
  const b = modelB;

  function bestValue() {
    if (!a || !b) return '—';
    const ao = PRICING_ORDER[a.pricing_type] ?? 3;
    const bo = PRICING_ORDER[b.pricing_type] ?? 3;
    if (ao < bo) return a.name;
    if (bo < ao) return b.name;
    return 'Tie';
  }

  function bestAccuracy() {
    if (!a || !b) return '—';
    const as = a.benchmark_score || 0;
    const bs = b.benchmark_score || 0;
    if (as > bs) return a.name;
    if (bs > as) return b.name;
    return 'Tie';
  }

  function bestRated() {
    if (!a || !b) return '—';
    if (ratingsA > ratingsB) return a.name;
    if (ratingsB > ratingsA) return b.name;
    return 'Tie';
  }

  function isWinner(row: 'price' | 'accuracy' | 'rating', side: 'a' | 'b') {
    const left = side === 'a' ? a : b;
    const right = side === 'a' ? b : a;
    if (!left || !right) return false;
    if (row === 'price') {
      const lo = PRICING_ORDER[left.pricing_type] ?? 3;
      const ro = PRICING_ORDER[right.pricing_type] ?? 3;
      return lo < ro;
    }
    if (row === 'accuracy') {
      return (left.benchmark_score || 0) > (right.benchmark_score || 0);
    }
    if (row === 'rating') {
      const leftR = side === 'a' ? ratingsA : ratingsB;
      const rightR = side === 'a' ? ratingsB : ratingsA;
      return leftR > rightR;
    }
    return false;
  }

  const rows = [
    { label: 'Company', render: (m: Model) => (m as any).companies?.name || 'Unknown' },
    { label: 'Launched', render: (m: Model) => m.launched_at ? new Date(m.launched_at).toLocaleDateString() : 'N/A' },
    {
      label: 'Pricing type',
      render: (m: Model) => {
        const badge = pricingBadge(m.pricing_type);
        return <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 4, background: badge.bg, color: badge.text, textTransform: 'capitalize' }}>{m.pricing_type}</span>;
      },
    },
    { label: 'Price detail', render: (m: Model) => m.pricing_detail || '—' },
    { label: 'Context window', render: (m: Model) => m.context_window || 'N/A' },
    {
      label: 'Benchmark score',
      winner: 'accuracy' as const,
      render: (m: Model) => m.benchmark_score != null ? <ScoreBar score={m.benchmark_score} /> : 'N/A',
    },
    {
      label: 'Community rating',
      winner: 'rating' as const,
      render: (m: Model, idx: number) => <StarRating score={idx === 0 ? ratingsA : ratingsB} />,
    },
    {
      label: 'Use cases',
      render: (m: Model) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {m.use_cases?.map((uc: string) => (
            <span key={uc} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 4, background: '#E7F0FD', color: '#1877F2', fontWeight: 500 }}>{uc}</span>
          )) || 'N/A'}
        </div>
      ),
    },
    {
      label: 'Official link',
      render: (m: Model) => m.official_url ? (
        <a href={m.official_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 4, border: '1px solid #1877F2', color: '#1877F2', textDecoration: 'none', display: 'inline-block' }}>
          Visit site →
        </a>
      ) : '—',
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '32px 0 4px' }}>Compare AI Models</h1>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>Pick any two models to compare side by side</p>

      {loading ? (
        <p style={{ fontSize: 14, color: '#6b7280' }}>Loading models...</p>
      ) : (
        <>
          {/* Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Select Model A</label>
              <select
                value={modelA?.id || ''}
                onChange={(e) => selectModelA(e.target.value)}
                style={{ width: '100%', fontSize: 14, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none' }}
              >
                <option value="">Select a model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {a && <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0' }}>{(a as any).companies?.name || 'Unknown'}</p>}
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Select Model B</label>
              <select
                value={modelB?.id || ''}
                onChange={(e) => selectModelB(e.target.value)}
                style={{ width: '100%', fontSize: 14, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none' }}
              >
                <option value="">Select a model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {b && <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0' }}>{(b as any).companies?.name || 'Unknown'}</p>}
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={!a || !b}
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: '10px 24px',
              borderRadius: 4,
              background: !a || !b ? '#e5e7eb' : '#1877F2',
              color: !a || !b ? '#9ca3af' : '#fff',
              border: 'none',
              cursor: !a || !b ? 'not-allowed' : 'pointer',
              marginBottom: 32,
            }}
            onMouseEnter={(e) => { if (a && b) (e.target as HTMLButtonElement).style.background = '#1565D8'; }}
            onMouseLeave={(e) => { if (a && b) (e.target as HTMLButtonElement).style.background = '#1877F2'; }}
          >
            Compare
          </button>

          {/* Comparison Table */}
          {a && b && (
            <>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
                {/* Desktop table */}
                <div style={{ display: 'none' }} className="compare-desktop">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: 140, fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Feature</th>
                        <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>{a.name}</th>
                        <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>{b.name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, ri) => (
                        <tr key={row.label} style={{ background: ri % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                          <td style={{ padding: 14, borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: 500, fontSize: 13 }}>{row.label}</td>
                          <td style={{ padding: 14, borderBottom: '1px solid #e5e7eb', fontWeight: row.winner && isWinner(row.winner, 'a') ? 700 : 400, color: row.winner && isWinner(row.winner, 'a') ? '#1877F2' : '#1a1a1a' }}>
                            {row.render(a, 0)}
                          </td>
                          <td style={{ padding: 14, borderBottom: '1px solid #e5e7eb', fontWeight: row.winner && isWinner(row.winner, 'b') ? 700 : 400, color: row.winner && isWinner(row.winner, 'b') ? '#1877F2' : '#1a1a1a' }}>
                            {row.render(b, 1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile stacked cards */}
                <div className="compare-mobile">
                  {[a, b].map((m, mi) => (
                    <div key={m.id} style={{ borderBottom: '1px solid #e5e7eb', padding: '16px 14px', background: mi % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#1877F2' }}>{m.name}</div>
                      {rows.map((row) => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px dashed #e5e7eb' }}>
                          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, minWidth: 120 }}>{row.label}</span>
                          <span style={{ fontSize: 13, textAlign: 'right', flex: 1 }}>{row.render(m, mi)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Verdict Card */}
              <div style={{ border: '1px solid #1877F2', borderRadius: 8, padding: 16, background: '#E7F0FD', marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', color: '#1a1a1a' }}>Quick Verdict</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 14 }}>
                    <span style={{ fontWeight: 600 }}>Best value: </span>
                    <span style={{ color: '#1877F2', fontWeight: 600 }}>{bestValue()}</span>
                  </div>
                  <div style={{ fontSize: 14 }}>
                    <span style={{ fontWeight: 600 }}>Best accuracy: </span>
                    <span style={{ color: '#1877F2', fontWeight: 600 }}>{bestAccuracy()}</span>
                  </div>
                  <div style={{ fontSize: 14 }}>
                    <span style={{ fontWeight: 600 }}>Best rated: </span>
                    <span style={{ color: '#1877F2', fontWeight: 600 }}>{bestRated()}</span>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div style={{ marginBottom: 40 }}>
                <button
                  onClick={handleShare}
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '8px 16px',
                    borderRadius: 4,
                    border: '1px solid #1877F2',
                    background: '#fff',
                    color: '#1877F2',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#E7F0FD'; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#fff'; }}
                >
                  {copied ? 'Copied!' : 'Share this comparison'}
                </button>
              </div>
            </>
          )}

          {/* Popular Comparisons */}
          <div style={{ marginBottom: 48 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>Popular comparisons</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {POPULAR.map((p) => (
                <button
                  key={p.label}
                  onClick={() => loadPopular(p.a, p.b)}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: 'none',
                    background: '#E7F0FD',
                    color: '#1877F2',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#d4e4fc'; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#E7F0FD'; }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .compare-desktop { display: block !important; }
          .compare-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .compare-desktop { display: none !important; }
          .compare-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}
