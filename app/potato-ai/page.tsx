'use client';

import { useState, useEffect, useRef } from 'react';

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

type Message = {
  role: 'user' | 'assistant';
  text: string;
  related?: string[];
};

export default function PotatoAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggested, setSuggested] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggested(shuffleArray(SUGGESTED_QUESTIONS).slice(0, 4));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function ask(query: string) {
    setLoading(true);
    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: query }]);

    try {
      const response = await fetch('/api/potato-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
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
          const answer = parts[0].trim();
          const relatedLines = parts[1]
            ?.trim()
            .split('\n')
            .filter((l) => l.trim().startsWith('•'))
            .map((l) => l.replace('•', '').trim());
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, text: answer, related: relatedLines };
            } else {
              next.push({ role: 'assistant', text: answer, related: relatedLines });
            }
            return next;
          });
        } else {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, text: fullText };
            } else {
              next.push({ role: 'assistant', text: fullText });
            }
            return next;
          });
        }
      }
    } catch {
      setError('Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setInput('');
    ask(input.trim());
  }

  function clearConversation() {
    setMessages([]);
    setError('');
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0 16px', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 4px', color: '#1a1a1a' }}>Potato AI</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Ask anything about AI</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            style={{ fontSize: 13, padding: '6px 12px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer' }}
          >
            Clear conversation
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🥔</div>
            <p style={{ fontSize: 16, color: '#6b7280', margin: '0 0 24px' }}>India&apos;s AI expert. Powered by Gemini.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {suggested.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  style={{
                    fontSize: 13,
                    padding: '8px 16px',
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
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1877F2', marginBottom: 4 }}>Potato AI</div>
            )}
            <div
              style={{
                maxWidth: '85%',
                padding: msg.role === 'user' ? '10px 16px' : '14px 18px',
                borderRadius: 10,
                background: msg.role === 'user' ? '#E7F0FD' : '#fff',
                color: msg.role === 'user' ? '#1877F2' : '#1a1a1a',
                border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                fontSize: 15,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}
            </div>
            {msg.role === 'assistant' && msg.related && msg.related.length > 0 && (
              <div style={{ marginTop: 8, paddingLeft: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Related questions:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {msg.related.map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q)}
                      style={{ fontSize: 13, color: '#1877F2', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      • {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1877F2', animation: 'pulse 1s infinite' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1877F2', animation: 'pulse 1s infinite 0.2s' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1877F2', animation: 'pulse 1s infinite 0.4s' }} />
            <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>Potato AI is thinking...</span>
          </div>
        )}

        {error && (
          <div style={{ padding: 12, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 14, marginTop: 8 }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: '12px 0 24px', flexShrink: 0, display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Potato AI anything about AI..."
          disabled={loading}
          style={{
            flex: 1,
            fontSize: 15,
            padding: '12px 16px',
            border: '1.5px solid #e5e7eb',
            borderRadius: 10,
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.border = '2px solid #1877F2'; }}
          onBlur={(e) => { e.target.style.border = '1.5px solid #e5e7eb'; }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            fontSize: 14,
            fontWeight: 500,
            padding: '12px 20px',
            borderRadius: 8,
            background: '#1877F2',
            color: '#fff',
            border: 'none',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            opacity: input.trim() && !loading ? 1 : 0.6,
          }}
          onMouseEnter={(e) => { if (input.trim() && !loading) (e.target as HTMLButtonElement).style.background = '#1565D8'; }}
          onMouseLeave={(e) => { if (input.trim() && !loading) (e.target as HTMLButtonElement).style.background = '#1877F2'; }}
        >
          Ask
        </button>
      </form>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
