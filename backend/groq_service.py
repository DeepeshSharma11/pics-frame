import os
import json
import logging
from typing import List, Optional, Dict, Any
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("groq_service")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

async def call_groq_chat(
    system_prompt: str,
    user_prompt: str,
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    response_json: bool = False,
) -> str:
    """Calls Groq Cloud API using the OpenAI compatible endpoint."""
    api_key = GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
    chosen_model = model or GROQ_MODEL

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload: Dict[str, Any] = {
        "model": chosen_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if response_json:
        payload["response_format"] = {"type": "json_object"}

    if not api_key:
        logger.warning("GROQ_API_KEY is not set. Using smart fallback.")
        return ""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(GROQ_API_URL, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("choices", [{}])[0].get("message", {}).get("content", "")
            else:
                logger.error(f"Groq API error {resp.status_code}: {resp.text}")
                return ""
    except Exception as e:
        logger.error(f"Groq API call exception: {e}")
        return ""

async def generate_love_letter_ai(
    recipient_name: str,
    sender_name: str,
    occasion: str = "anniversary",
    tone: str = "romantic",
    key_details: str = "",
    relationship_date: str = "",
) -> Dict[str, str]:
    """Uses Groq Qwen model to write a personalized love letter and title."""
    system_prompt = (
        "You are an elite, deeply touching romantic writer and poet. "
        "Your task is to write a personalized, authentic, and emotionally resonant letter for a custom memory gift frame. "
        "Keep it heartfelt, poetic, and intimate without sounding cliché. "
        "Return ONLY a valid JSON object with keys 'title' (short poetic title, 3-6 words) and 'letter' (2-4 paragraphs)."
    )

    user_prompt = f"""
Information details:
- Recipient Name: {recipient_name or 'My Love'}
- Sender Name: {sender_name or 'Yours Always'}
- Occasion: {occasion}
- Tone / Vibe: {tone} (e.g. deeply romantic, poetic, playful & sweet, emotional)
- Special Memories / Key Details: {key_details or 'Every moment, laugh, and quiet glance together'}
- Special Date / Milestone: {relationship_date or 'Our eternal date'}

Write a beautiful, personalized message from {sender_name or 'me'} to {recipient_name or 'my love'}.
Respond in strict JSON format:
{{
  "title": "...",
  "letter": "..."
}}
"""

    raw = await call_groq_chat(system_prompt, user_prompt, response_json=True)
    if raw:
        try:
            data = json.loads(raw)
            if "letter" in data:
                return {
                    "title": data.get("title", f"To {recipient_name or 'My Love'}, Forever"),
                    "letter": data.get("letter", "").strip(),
                }
        except Exception:
            pass

    # Fallback if API key not set or failed
    title = f"Every Moment With You, {recipient_name or 'My Love'}"
    letter = (
        f"Dearest {recipient_name or 'Love'},\n\n"
        f"From the very first moment we met, you turned ordinary days into my favorite adventures. "
        f"{key_details if key_details else 'Every quiet smile, inside joke, and whispered promise we share means the universe to me.'}\n\n"
        f"No matter where life leads us, holding your hand is where I belong. Happy {occasion.replace('_', ' ').title()}! "
        f"Here's to all our chapters yet to come.\n\n"
        f"Forever and always,\n{sender_name or 'Yours Truly'}"
    )
    return {"title": title, "letter": letter}

async def enhance_letter_ai(
    text: str,
    recipient_name: str = "My Love",
    sender_name: str = "Yours Always",
    tone: str = "romantic & poetic",
) -> Dict[str, str]:
    """Uses Groq Qwen model to enhance and polish a user draft."""
    system_prompt = (
        "You are an expert romantic editor. Your job is to elevate and polish the user's drafted message or love letter. "
        "Enhance the emotional depth, evocative imagery, and lyrical rhythm while strictly preserving their original meaning and authentic feeling. "
        "Return ONLY a valid JSON object with key 'enhanced_text'."
    )

    user_prompt = f"""
Original Draft:
\"\"\"{text}\"\"\"

Context:
- For: {recipient_name}
- From: {sender_name}
- Desired Tone: {tone}

Refine and enhance this message to make it deeply touching, memorable, and beautifully worded.
Respond in strict JSON format:
{{
  "enhanced_text": "..."
}}
"""

    raw = await call_groq_chat(system_prompt, user_prompt, response_json=True)
    if raw:
        try:
            data = json.loads(raw)
            if "enhanced_text" in data:
                return {"enhanced_text": data.get("enhanced_text", "").strip()}
        except Exception:
            pass

    # Fallback
    enhanced = (
        f"{text.strip()}\n\n"
        f"Every heartbeat with you is a gift, and I will cherish you endlessly, {recipient_name}."
    )
    return {"enhanced_text": enhanced}

async def suggest_captions_ai(
    recipient_name: str = "My Love",
    occasion: str = "anniversary",
    count: int = 5,
    context_hints: str = "",
) -> List[Dict[str, str]]:
    """Generates romantic photo captions, chapter titles, and location tags."""
    system_prompt = (
        "You are an artistic storyteller and romance writer for a memory photo frame. "
        "Generate a series of sweet, poetic captions, chapter titles, and evocative location tags for a couple's photos. "
        "Return ONLY a valid JSON object with key 'captions' containing an array of objects."
    )

    user_prompt = f"""
Context:
- Partner: {recipient_name}
- Occasion: {occasion}
- Number of photos: {count}
- Extra context / memories: {context_hints or 'Sweet dates, laughter, sunsets, hand-holding, travels'}

Generate {count} distinct chapters. Each chapter must have:
- "chapter": Short title (e.g. "Chapter 1: Where Magic Began")
- "caption": 1-2 sentence romantic, heartwarming caption
- "location": Romantic setting (e.g. "Sunset Boulevard", "Under the Stars", "Our Quiet Coffee Spot")

Respond in strict JSON format:
{{
  "captions": [
    {{
      "chapter": "Chapter 1: ...",
      "caption": "...",
      "location": "..."
    }}
  ]
}}
"""

    raw = await call_groq_chat(system_prompt, user_prompt, response_json=True)
    if raw:
        try:
            data = json.loads(raw)
            captions = data.get("captions", [])
            if isinstance(captions, list) and len(captions) > 0:
                return captions
        except Exception:
            pass

    # Default fallback list
    fallbacks = [
        {"chapter": "Chapter 1: The First Spark", "caption": "Where our story began and my world changed forever.", "location": "Where We First Met"},
        {"chapter": "Chapter 2: Endless Laughter", "caption": "The laugh that never fails to light up my darkest days.", "location": "Coffee & Rainy Days"},
        {"chapter": "Chapter 3: Golden Hours", "caption": "Holding your hand beneath the golden skies.", "location": "Sunset Vista"},
        {"chapter": "Chapter 4: Little Moments", "caption": "Every ordinary day with you is my favorite memory.", "location": "Our Cozy Corner"},
        {"chapter": "Chapter 5: Into Forever", "caption": "To all the unwritten adventures waiting for us.", "location": "Our Beautiful Tomorrow"},
    ]
    return fallbacks[:count] if count <= len(fallbacks) else fallbacks

async def suggest_proposals_ai(
    recipient_name: str = "My Love",
    sender_name: str = "Yours Always",
    tone: str = "romantic",
) -> List[str]:
    """Generates surprise / proposal questions."""
    system_prompt = (
        "You are a romantic writer. Generate 5 unique, breathtaking proposal or surprise celebration questions for a couple's memory gift. "
        "Return ONLY a JSON object with key 'proposals' containing an array of 5 strings."
    )
    user_prompt = f"Partner: {recipient_name}, Sender: {sender_name}, Tone: {tone}. Give 5 sweet proposal/surprise lines."

    raw = await call_groq_chat(system_prompt, user_prompt, response_json=True)
    if raw:
        try:
            data = json.loads(raw)
            proposals = data.get("proposals", [])
            if isinstance(proposals, list) and len(proposals) > 0:
                return proposals
        except Exception:
            pass

    return [
        f"Will you do me the honor of making me the happiest person forever, {recipient_name}? 💍",
        f"From this moment to eternity, will you walk through life hand in hand with me? ✨",
        f"You are my whole heart. Will you marry me? 💖",
        f"To a lifetime of laughing with you, loving you, and choosing you every single day. 🌹",
        f"Happy Anniversary Jaan! Here's to us, forever and always. 🥂",
    ]

async def suggest_reasons_ai(
    recipient_name: str = "My Love",
    sender_name: str = "Yours Always",
    count: int = 5,
) -> List[str]:
    """Generates 'Reasons Why I Adore You'."""
    system_prompt = (
        "Generate heartwarming, authentic reasons why someone adores their partner. "
        "Return ONLY a JSON object with key 'reasons' containing an array of strings."
    )
    user_prompt = f"Generate {count} sweet, specific, and loving reasons for {recipient_name} from {sender_name}."

    raw = await call_groq_chat(system_prompt, user_prompt, response_json=True)
    if raw:
        try:
            data = json.loads(raw)
            reasons = data.get("reasons", [])
            if isinstance(reasons, list) and len(reasons) > 0:
                return reasons
        except Exception:
            pass

    return [
        "The gentle way you smile whenever you catch me looking at you.",
        "How you make even the quietest ordinary moments feel extraordinary.",
        "Your kindness, warmth, and the immense love you bring into my life.",
        "The unforgettable feeling of holding your hand under city lights.",
        f"Because loving you, {recipient_name}, is the easiest and most beautiful thing I have ever done.",
    ]
