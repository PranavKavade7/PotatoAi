'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SubscribeWidget from '@/components/SubscribeWidget';
import { supabase } from '@/lib/supabase';

const SUGGESTED_QUESTIONS = [
  'Which AI is best for coding?',
  'ChatGPT vs Claude vs Gemini — which is best?',
  'What is the cheapest AI tool available?',
  'What is a token in AI?',
  'Which AI can I use for free in India?',
  'What is the difference between GPT-4 and GPT-4o?',
  'Which AI is best for writing content?',
  'What is RAG in AI?',
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function usePotatoAI() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [related, setRelated] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function ask(q: string) {
    setLoading(true);
    setAnswer('');
    setRelated([]);
    setError('');

    try {
      const response = await fetch('/api/potato-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok) {
        const text = await response.text();
        setError(text || 'Something went wrong.');
        setLoading(false);
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullText += chunk;

        if (fullText.includes('RELATED:')) {
          const parts = fullText.split('RELATED:');
          setAnswer(parts[0].trim());
          const relatedLines = parts[1]
            ?.trim()
            .split('\n')
            .filter((l) => l.trim().startsWith('•'))
            .map((l) => l.replace('•', '').trim());
          setRelated(relatedLines || []);
        } else {
          setAnswer(fullText);
        }
      }
    } catch (e) {
      setError('Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return { query, setQuery, answer, related, loading, error, ask };
}

function PotatoAIHero({ onAsk }: { onAsk: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const [suggested] = useState(() => shuffleArray(SUGGESTED_QUESTIONS).slice(0, 4));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    onAsk(query.trim());
  }

  return (
    <section style={{ padding: '48px 0 32px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 32, fontWeight: 500, margin: '0 0 8px', color: '#1a1a1a' }}>
        Everything AI. One place.
      </h1>
      <p style={{ fontSize: 18, color: '#555', margin: '0 0 24px' }}>
        Ask Potato AI anything about artificial intelligence.
      </p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Ask Potato AI — "Which AI is best for coding?"'
          style={{
            width: '100%',
            fontSize: 16,
            padding: '14px 18px',
            border: '1.5px solid #e5e7eb',
            borderRadius: 10,
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.border = '2px solid #1877F2'; }}
          onBlur={(e) => { e.target.style.border = '1.5px solid #e5e7eb'; }}
        />
        <button
          type="submit"
          disabled={!query.trim()}
          style={{
            alignSelf: 'center',
            fontSize: 15,
            fontWeight: 500,
            padding: '12px 28px',
            borderRadius: 8,
            background: '#1877F2',
            color: '#fff',
            border: 'none',
            cursor: query.trim() ? 'pointer' : 'not-allowed',
            opacity: query.trim() ? 1 : 0.6,
          }}
          onMouseEnter={(e) => { if (query.trim()) (e.target as HTMLButtonElement).style.background = '#1565D8'; }}
          onMouseLeave={(e) => { if (query.trim()) (e.target as HTMLButtonElement).style.background = '#1877F2'; }}
        >
          Ask Potato AI
        </button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>Suggested:</span>
        {suggested.map((q) => (
          <button
            key={q}
            onClick={() => onAsk(q)}
            style={{
              fontSize: 13,
              padding: '6px 14px',
              borderRadius: 100,
              border: 'none',
              background: '#E7F0FD',
              color: '#1877F2',
              cursor: 'pointer',
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}

function PotatoAIAnswer({ answer, related, loading, error, onRelatedClick }: {
  answer: string;
  related: string[];
  loading: boolean;
  error: string;
  onRelatedClick: (q: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyAnswer() {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading && !answer) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto 48px', textAlign: 'center', padding: '24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1877F2', animation: 'pulse 1s infinite' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1877F2', animation: 'pulse 1s infinite 0.2s' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1877F2', animation: 'pulse 1s infinite 0.4s' }} />
          <span style={{ fontSize: 14, color: '#6b7280', marginLeft: 8 }}>Potato AI is thinking...</span>
        </div>
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto 48px', padding: 16, borderRadius: 12, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 14 }}>
        {error}
      </div>
    );
  }

  if (!answer) return null;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto 48px', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#1877F2' }}>🥔 Potato AI</div>
        <button
          onClick={copyAnswer}
          style={{ fontSize: 13, padding: '4px 10px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', color: '#1877F2', cursor: 'pointer' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: '#1a1a1a', whiteSpace: 'pre-wrap' }}>{answer}</div>
      </div>
      {related.length > 0 && (
        <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 16, paddingTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Related questions:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {related.map((q) => (
              <button
                key={q}
                onClick={() => onRelatedClick(q)}
                style={{ fontSize: 14, color: '#1877F2', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                • {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [topModels, setTopModels] = useState<any[]>([]);
  const [newLaunches, setNewLaunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const potato = usePotatoAI();

  useEffect(() => {
    async function fetchData() {
      const [{ data: newsData }, { data: modelsData }, { data: launchesData }] = await Promise.all([
        supabase.from('news').select('*').order('published_at', { ascending: false }).limit(6),
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

  const handleAsk = useCallback((q: string) => {
    potato.setQuery(q);
    potato.ask(q);
  }, [potato]);

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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* Potato AI Hero */}
      <PotatoAIHero onAsk={handleAsk} />

      {/* Potato AI Answer */}
      <PotatoAIAnswer
        answer={potato.answer}
        related={potato.related}
        loading={potato.loading}
        error={potato.error}
        onRelatedClick={handleAsk}
      />

      {/* Top News */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Today&apos;s top AI news</h2>
          <Link href="/news" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>View all →</Link>
        </div>
        {loading ? (
          <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
        ) : (
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
        )}
      </section>

      {/* Top Models */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Top rated AI models</h2>
          <Link href="/models" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>View all →</Link>
        </div>
        {loading ? (
          <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
        ) : (
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
        )}
      </section>

      {/* New Launches */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>New model launches</h2>
          <Link href="/models" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>View all →</Link>
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
        )}
      </section>

      {/* Subscribe Widget */}
      <section style={{ marginBottom: 48 }}>
        <SubscribeWidget />
      </section>
    </div>
  );
}
