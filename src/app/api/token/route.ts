import { NextResponse } from 'next/server';
import { GoogleGenAI, Modality, ThinkingLevel } from '@google/genai';

/**
 * Mints an ephemeral auth token for a browser-side Gemini Live session.
 *
 * The real `GEMINI_API_KEY` never reaches the client. Instead the whole session
 * shape (model, modality, persona, voice, transcription) is baked into the
 * token's `liveConnectConstraints`. Because `lockAdditionalFields` is omitted,
 * every field of `LiveConnectConfig` is locked server-side — anything the
 * browser tries to override is silently ignored by the API, so the system
 * instruction cannot be tampered with from devtools.
 */

type SupportedLocale = 'en' | 'ar';

const BASE_PERSONA = `You are Omar's AI representative on his personal portfolio website.
Omar is a senior full-stack engineer and technical architect specializing in Next.js, WebGL, GSAP, Turso/LibSQL, and AI-driven platforms.
He builds high-performance web applications, local-first offline engines, and AI systems.
Be warm, professional and concise. Speak in short, natural sentences suitable for a live voice conversation — never use lists, markdown or headings, because your words are spoken aloud.
Keep answers under three sentences unless the visitor explicitly asks for depth.
If visitors ask about hiring Omar, rates, or availability, give a brief overview of his capabilities and invite them to reach out using the site's contact options.
If you do not know something about Omar, say so plainly instead of inventing details.`;

/** Persona + speech settings per locale. Server-only: these are not UI strings. */
const LOCALE_CONFIG: Record<
  SupportedLocale,
  { instruction: string; languageCode: string; voiceName: string }
> = {
  en: {
    instruction: `${BASE_PERSONA}\nRespond in English unless the visitor speaks another language, in which case mirror their language.`,
    languageCode: 'en-US',
    voiceName: 'Kore'
  },
  ar: {
    instruction: `${BASE_PERSONA}\nRespond in Modern Standard Arabic by default, in a natural spoken register. If the visitor switches to English, mirror their language. Keep technical product names (Next.js, GSAP, WebGL, Turso) in Latin script.`,
    languageCode: 'ar-EG',
    voiceName: 'Kore'
  }
};

function resolveLocale(value: unknown): SupportedLocale {
  return value === 'ar' ? 'ar' : 'en';
}

/* --------------------------------------------------------------------------
   Lightweight abuse guard
   --------------------------------------------------------------------------
   This route mints billable live sessions, so a public unauthenticated POST
   needs at least a speed bump. The window lives in module scope, which means
   it is per-instance (best effort on serverless) — enough to stop trivial
   scripted farming, not a substitute for KV/Redis if traffic ever justifies it.
   -------------------------------------------------------------------------- */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_TOKENS = 5;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** @returns seconds to wait, or `null` when the request is allowed. */
function rateLimit(ip: string): number | null {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);

  if (recent.length >= RATE_MAX_TOKENS) {
    hits.set(ip, recent);
    return Math.ceil((RATE_WINDOW_MS - (now - recent[0])) / 1000);
  }

  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic sweep so the map cannot grow unbounded.
  if (hits.size > 500) {
    for (const [key, stamps] of hits) {
      if (stamps.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }

  return null;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY environment variable is not set.' },
      { status: 500 }
    );
  }

  const retryAfter = rateLimit(clientIp(request));
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'Too many voice sessions from this address. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const body = await request.json().catch(() => null);
  const locale = resolveLocale(
    body && typeof body === 'object' ? (body as { locale?: unknown }).locale : undefined
  );
  const { instruction, languageCode, voiceName } = LOCALE_CONFIG[locale];

  try {
    const ai = new GoogleGenAI({ apiKey });

    const token = await ai.authTokens.create({
      config: {
        // One session per token; the client fetches a fresh one on each connect.
        uses: 1,
        // Short-lived on purpose: limits the blast radius of a leaked token.
        expireTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model: 'models/gemini-3.1-flash-live-preview',
          config: {
            // Native audio models are audio-out only; the on-screen transcript
            // comes from outputAudioTranscription, not a TEXT modality.
            responseModalities: [Modality.AUDIO],
            systemInstruction: { parts: [{ text: instruction }] },
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } },
              languageCode
            },
            inputAudioTranscription: {
              languageHints: { languageCodes: [languageCode] }
            },
            outputAudioTranscription: {},
            // Lowest latency; this is a conversational widget, not a reasoner.
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            // Keeps long chats alive past the uncompressed 15-minute ceiling.
            contextWindowCompression: { slidingWindow: {} }
          }
        },
        // Ephemeral token support is v1alpha only.
        httpOptions: { apiVersion: 'v1alpha' }
      }
    });

    if (!token.name) {
      throw new Error('Gemini returned an auth token without a name.');
    }

    return NextResponse.json(
      { token: token.name },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create ephemeral token';
    console.error('Error creating ephemeral token:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
