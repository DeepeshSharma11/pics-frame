export interface AIWriteParams {
  recipient_name?: string;
  sender_name?: string;
  occasion?: string;
  tone?: string;
  key_details?: string;
  relationship_date?: string;
  model?: string;
}

export interface AIEnhanceParams {
  text: string;
  recipient_name?: string;
  sender_name?: string;
  tone?: string;
  model?: string;
}

export interface AICaptionsParams {
  recipient_name?: string;
  occasion?: string;
  count?: number;
  context_hints?: string;
  model?: string;
}

export interface CaptionResult {
  chapter: string;
  caption: string;
  location: string;
}

export const GROQ_MODEL = "qwen/qwen3.8-27b";

export async function aiWriteLetter(params: AIWriteParams): Promise<{ title: string; letter: string }> {
  try {
    const res = await fetch("/api/backend/ai/write-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: GROQ_MODEL, ...params }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.letter) {
        return { title: data.title || "Our Eternal Journey", letter: data.letter };
      }
    }
  } catch (err) {
    console.warn("AI backend offline or error, applying intelligent fallback:", err);
  }

  // Client-side intelligent fallback
  const recipient = params.recipient_name || "My Love";
  const sender = params.sender_name || "Yours Always";
  const details = params.key_details ? `${params.key_details}. ` : "";
  const occasion = (params.occasion || "anniversary").replace(/_/g, " ");

  return {
    title: `Every Moment With You, ${recipient}`,
    letter: `Dearest ${recipient},\n\nFrom the very first day our paths crossed, every moment with you has felt like a miracle. ${details}You bring an effortless warmth and radiance into my world that nothing else ever could.\n\nHappy ${occasion}! Thank you for your endless laughter, quiet comfort, and unconditional love. Here's to writing a thousand more unforgettable chapters together.\n\nForever and always,\n${sender}`,
  };
}

export async function aiEnhanceLetter(params: AIEnhanceParams): Promise<string> {
  try {
    const res = await fetch("/api/backend/ai/enhance-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: GROQ_MODEL, ...params }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.enhanced_text) {
        return data.enhanced_text;
      }
    }
  } catch (err) {
    console.warn("AI backend offline or error, applying intelligent fallback:", err);
  }

  // Fallback enhancement
  const recipient = params.recipient_name || "My Love";
  return `${params.text.trim()}\n\nEvery heartbeat with you is a gift, and I will cherish you endlessly, ${recipient}.`;
}

export async function aiSuggestCaptions(params: AICaptionsParams): Promise<CaptionResult[]> {
  try {
    const res = await fetch("/api/backend/ai/suggest-captions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: GROQ_MODEL, ...params }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.captions) && data.captions.length > 0) {
        return data.captions;
      }
    }
  } catch (err) {
    console.warn("AI captions backend offline or error, applying intelligent fallback:", err);
  }

  const count = params.count || 5;
  const fallbacks: CaptionResult[] = [
    { chapter: "Chapter 1: The First Spark", caption: "Where our story began and everything became magical.", location: "Our First Walk" },
    { chapter: "Chapter 2: Endless Laughter", caption: "Your laugh that never fails to light up my whole universe.", location: "Coffee & Rainy Days" },
    { chapter: "Chapter 3: Golden Hours", caption: "Holding hands beneath golden skies and dreamscapes.", location: "Sunset Vista" },
    { chapter: "Chapter 4: Little Wonders", caption: "Every quiet ordinary day with you is my favorite memory.", location: "Our Cozy Corner" },
    { chapter: "Chapter 5: Into Forever", caption: "To all our unwritten adventures and a lifetime of love.", location: "Our Beautiful Tomorrow" },
  ];

  return fallbacks.slice(0, count);
}

export async function aiSuggestProposal(recipient_name = "My Love", sender_name = "Yours Always"): Promise<string[]> {
  try {
    const res = await fetch("/api/backend/ai/suggest-proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_name, sender_name }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.proposals) && data.proposals.length > 0) {
        return data.proposals;
      }
    }
  } catch (err) {
    console.warn("AI proposal backend offline, using fallback:", err);
  }

  return [
    `Will you do me the honor of making me the happiest person forever, ${recipient_name}? 💍`,
    `From this moment to eternity, will you walk hand in hand with me? ✨`,
    `You are my whole heart and universe. Will you marry me? 💖`,
    `To a lifetime of laughing with you, loving you, and choosing you every day. 🌹`,
    `Happy Anniversary Jaan! Here's to us, forever and always. 🥂`,
  ];
}
