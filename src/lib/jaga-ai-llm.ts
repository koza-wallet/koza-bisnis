import OpenAI from 'openai';
import { recordLLMFailure, recordLLMSuccess } from '@/lib/ai-cost-guard';

export interface GenerateChatReplyParams {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeDistrict?: string;
  storeCity?: string;
  catalogContext: string;
  userMessage: string;
  preferredProvider?: 'auto' | 'openai' | 'gemini';
}

export interface GenerateChatReplyResult {
  reply: string;
  providerUsed: 'openai' | 'gemini' | 'fallback';
  success: boolean;
}

/**
 * Resolusi API Key secara terpisah:
 * OpenAI: Mengutamakan JAGA_AI_OPENAI_API_KEY, lalu fallback ke OPENAI_API_KEY
 * Gemini: Mengutamakan JAGA_AI_GEMINI_API_KEY, lalu fallback ke GEMINI_API_KEY
 */
export function getJagaAIOpenAIKey(): string {
  return process.env.JAGA_AI_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
}

export function getJagaAIGeminiKey(): string {
  return process.env.JAGA_AI_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
}

async function callOpenAI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const openai = new OpenAI({ apiKey });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 250,
        temperature: 0.7,
      },
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function callGemini(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  const combinedPrompt = `${systemPrompt}\n\nPesan dari pembeli:\n"${userMessage}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
          generationConfig: { maxOutputTokens: 250, temperature: 0.7 },
        }),
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Mesin utama pembuat balasan AI dengan dukungan dual-engine (OpenAI + Gemini)
 * dan failover otomatis jika salah satu provider mengalami kendala.
 */
export async function generateJagaAIReply(
  params: GenerateChatReplyParams
): Promise<GenerateChatReplyResult> {
  const {
    storeId,
    storeName,
    storeSlug,
    storeDistrict = '',
    storeCity = '',
    catalogContext,
    userMessage,
    preferredProvider = 'auto',
  } = params;

  const locationStr = [storeDistrict, storeCity].filter(Boolean).join(', ') || 'Indonesia';

  const systemPrompt = `Kamu adalah Jaga AI, asisten customer service WhatsApp toko online "${storeName}".
Tugasmu menjawab pesan calon pembeli dengan ramah, santun, dan sigap membantu.

Informasi Toko:
- Nama Toko: ${storeName}
- Lokasi: ${locationStr}
- Link Etalase Toko: https://www.kozabisnis.com/toko/${storeSlug}

Daftar Produk Toko:
${catalogContext}

Aturan Menjawab:
1. Gunakan Bahasa Indonesia yang sopan dan akrab (panggil "kak").
2. Jawab secara ringkas, jelas, dan santun (maksimal 2-3 kalimat).
3. Jika pembeli menanyakan produk yang ada di katalog, informasikan harga dan ketersediaan stoknya, lalu persilakan checkout di link toko: https://www.kozabisnis.com/toko/${storeSlug}
4. Jika produk yang ditanyakan tidak ada di katalog, sampaikan dengan sopan bahwa produk belum tersedia.
5. Jangan gunakan format markdown tebal (bold) berlebihan.`;

  const openaiKey = getJagaAIOpenAIKey();
  const geminiKey = getJagaAIGeminiKey();

  // Tentukan urutan provider berdasarkan preferensi dan ketersediaan key
  type ProviderChoice = 'openai' | 'gemini';
  const providerQueue: ProviderChoice[] = [];

  if (preferredProvider === 'gemini') {
    if (geminiKey) providerQueue.push('gemini');
    if (openaiKey) providerQueue.push('openai');
  } else {
    // Default / 'openai' / 'auto': Utamakan OpenAI (didukung JAGA_AI_OPENAI_API_KEY)
    if (openaiKey) providerQueue.push('openai');
    if (geminiKey) providerQueue.push('gemini');
  }

  for (const provider of providerQueue) {
    try {
      if (provider === 'openai' && openaiKey) {
        const reply = await callOpenAI(openaiKey, systemPrompt, userMessage);
        if (reply) {
          recordLLMSuccess(storeId);
          return { reply, providerUsed: 'openai', success: true };
        }
      } else if (provider === 'gemini' && geminiKey) {
        const reply = await callGemini(geminiKey, systemPrompt, userMessage);
        if (reply) {
          recordLLMSuccess(storeId);
          return { reply, providerUsed: 'gemini', success: true };
        }
      }
    } catch (err) {
      console.warn(`[JAGA-AI-LLM] Provider ${provider} gagal, mencoba provider berikutnya:`, err);
    }
  }

  // Jika semua provider gagal atau tidak ada API Key yang dikonfigurasi
  recordLLMFailure();
  const fallbackReply = `Halo kak! Terima kasih sudah menghubungi ${storeName}. Produk kami bisa dilihat dan dipesan langsung melalui etalase resmi kami di: https://www.kozabisnis.com/toko/${storeSlug} 😊`;

  return {
    reply: fallbackReply,
    providerUsed: 'fallback',
    success: false,
  };
}
