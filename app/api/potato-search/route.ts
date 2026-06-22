import { GoogleGenerativeAI } from '@google/generative-ai';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count += 1;
  return true;
}

const systemPrompt = `You are Potato AI, an expert AI assistant on AIPulse — India's #1 AI intelligence platform.

Your ONLY job is to answer questions about artificial intelligence: AI models, AI tools, AI companies, AI concepts, pricing, benchmarks, use cases, and AI news.

Rules:
1. ONLY answer AI-related questions. If someone asks about cricket, food, movies, or anything non-AI, say: "I'm Potato AI — I only know about artificial intelligence! Try asking me about ChatGPT, Claude, Gemini, or any AI topic."
2. Keep answers clear, simple, and useful. Write for an Indian audience — many users are new to AI.
3. Be specific: mention real model names, real prices, real comparisons.
4. Keep answers under 200 words unless the question genuinely needs more detail.
5. End EVERY answer with exactly 3 related follow-up questions on a new line, formatted as:
   RELATED:
   • [question 1]
   • [question 2]
   • [question 3]
6. Do not use markdown headers (##). Use plain paragraphs. Bold key terms using **term**.
7. Never make up prices or features. If unsure, say "as of my last update" and give the best known answer.
8. Sound friendly and knowledgeable, not robotic.`;

export async function POST(req: Request) {
  const ip = getClientIP(req);
  if (!checkRateLimit(ip)) {
    return new Response(
      "You've asked a lot! Please wait a few minutes before asking again.",
      { status: 429, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const { query } = await req.json();
  if (!query || query.trim().length < 3) {
    return new Response('Please ask a question.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response('API key not configured.', { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  try {
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: query }] }],
      systemInstruction: systemPrompt,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('exceeded')) {
      const fallback = `I'm Potato AI, your AI expert on AIPulse! Right now, I'm experiencing high demand and my AI brain is taking a quick breather. Please try again in a minute or two.

RELATED:
• What is the best free AI tool in India?
• How do I start using AI for writing?
• ChatGPT vs Gemini — which is cheaper?`;
      return new Response(fallback, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    return new Response('Something went wrong. Please try again.', { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
