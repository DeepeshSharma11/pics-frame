from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import os
from cloudinary_service import upload_image, is_cloudinary_configured
from groq_service import (
    generate_love_letter_ai,
    enhance_letter_ai,
    suggest_captions_ai,
    suggest_proposals_ai,
    suggest_reasons_ai,
    GROQ_MODEL,
)

app = FastAPI(
    title="Pics Frame API — Engineered by Deepesh Sharma (FociTech)",
    description="Full-stack memory gift API with Groq Qwen AI enhancement engineered by Deepesh Sharma",
    version="1.1.0",
    contact={
        "name": "Deepesh Sharma",
        "url": "https://focitech.in",
        "email": "deepesh@focitech.in",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = os.path.join(os.path.dirname(__file__), "gallery_data.json")

class PhotoItem(BaseModel):
    id: str
    url: str
    caption: str
    date: str
    location: Optional[str] = ""
    rotation: Optional[int] = 0

class GalleryConfig(BaseModel):
    recipient_name: str = Field(default="My Love")
    sender_name: str = Field(default="Yours Always")
    anniversary_date: str = Field(default="2023-01-01")
    title: str = Field(default="Every Moment With You")
    letter: str = Field(
        default="From the very first moment we met to every quiet laugh we share, every memory with you is my favorite chapter. Thank you for making every day magical."
    )
    music_theme: str = Field(default="romantic_piano")
    theme: Optional[str] = Field(default="rose")
    particle_type: Optional[str] = Field(default="hearts")
    occasion_type: Optional[str] = Field(default="anniversary")
    surprise_message: Optional[str] = Field(default="")
    reasons: Optional[List[str]] = Field(default_factory=list)
    photos: List[PhotoItem] = Field(default_factory=list)

class AIWriteLetterRequest(BaseModel):
    recipient_name: Optional[str] = "My Love"
    sender_name: Optional[str] = "Yours Always"
    occasion: Optional[str] = "anniversary"
    tone: Optional[str] = "romantic"
    key_details: Optional[str] = ""
    relationship_date: Optional[str] = ""
    model: Optional[str] = None

class AIEnhanceRequest(BaseModel):
    text: str
    recipient_name: Optional[str] = "My Love"
    sender_name: Optional[str] = "Yours Always"
    tone: Optional[str] = "romantic & poetic"
    model: Optional[str] = None

class AICaptionsRequest(BaseModel):
    recipient_name: Optional[str] = "My Love"
    occasion: Optional[str] = "anniversary"
    count: Optional[int] = 5
    context_hints: Optional[str] = ""
    model: Optional[str] = None

class AIProposalRequest(BaseModel):
    recipient_name: Optional[str] = "My Love"
    sender_name: Optional[str] = "Yours Always"
    tone: Optional[str] = "romantic"

class AIReasonsRequest(BaseModel):
    recipient_name: Optional[str] = "My Love"
    sender_name: Optional[str] = "Yours Always"
    count: Optional[int] = 5

DEFAULT_CONFIG = {
    "recipient_name": "My Love",
    "sender_name": "Yours Always",
    "anniversary_date": "2023-02-14",
    "title": "Our Eternal Journey",
    "letter": "You turned ordinary days into unforgettable memories. Here are some of my favorite moments of us that I will cherish forever.",
    "music_theme": "romantic_piano",
    "theme": "rose",
    "particle_type": "hearts",
    "occasion_type": "anniversary",
    "surprise_message": "",
    "reasons": [
        "The way your eyes sparkle whenever you laugh genuinely.",
        "How you make even the quietest ordinary moments feel extraordinary.",
        "Your kindness and warmth towards everyone around you.",
        "The unforgettable feeling of holding your hand under city lights.",
        "Because loving you is the easiest and most beautiful thing I've ever done.",
    ],
    "photos": [
        {
            "id": "1",
            "url": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
            "caption": "Where our story began - our first magical walk",
            "date": "Chapter 1",
            "location": "Sunset Boulevard",
            "rotation": -3
        },
        {
            "id": "2",
            "url": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80",
            "caption": "Your laugh that made my whole world stop",
            "date": "Chapter 2",
            "location": "Coffee & Rainy Days",
            "rotation": 4
        },
        {
            "id": "3",
            "url": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
            "caption": "Holding hands beneath a thousand city lights",
            "date": "Chapter 3",
            "location": "City Skyline",
            "rotation": -2
        },
        {
            "id": "4",
            "url": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop&q=80",
            "caption": "Golden hour smiles & sweet whispers",
            "date": "Chapter 4",
            "location": "Beachside Vista",
            "rotation": 3
        },
        {
            "id": "5",
            "url": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80",
            "caption": "To forever and all our unwritten adventures",
            "date": "Chapter 5",
            "location": "Into Tomorrow",
            "rotation": -4
        }
    ]
}

def load_data() -> dict:
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_CONFIG
    return DEFAULT_CONFIG

def save_data(data: dict):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@app.get("/")
def read_root():
    return {
        "message": "Pics Frame API",
        "status": "online",
        "ai_model": GROQ_MODEL,
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "cloudinary_configured": is_cloudinary_configured(),
        "ai_model": GROQ_MODEL,
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
    }

@app.get("/api/gallery", response_model=GalleryConfig)
def get_gallery():
    return load_data()

@app.post("/api/gallery", response_model=GalleryConfig)
def update_gallery(config: GalleryConfig):
    data = config.model_dump()
    save_data(data)
    return data

@app.post("/api/gallery/reset")
def reset_gallery():
    save_data(DEFAULT_CONFIG)
    return DEFAULT_CONFIG

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Uploads a single photo to Cloudinary / storage."""
    try:
        contents = await file.read()
        url = upload_image(contents, filename=file.filename or "photo.jpg")
        return {"url": url, "filename": file.filename, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== GROQ AI ENDPOINTS ====================

@app.post("/api/ai/write-letter")
async def write_letter(req: AIWriteLetterRequest):
    """Generates an AI personalized love letter and gift title using Groq Qwen."""
    res = await generate_love_letter_ai(
        recipient_name=req.recipient_name or "My Love",
        sender_name=req.sender_name or "Yours Always",
        occasion=req.occasion or "anniversary",
        tone=req.tone or "romantic",
        key_details=req.key_details or "",
        relationship_date=req.relationship_date or "",
    )
    return {
        "success": True,
        "model": req.model or GROQ_MODEL,
        **res,
    }

@app.post("/api/ai/enhance-letter")
async def enhance_letter(req: AIEnhanceRequest):
    """Enhances/polishes user drafted letter or notes using Groq Qwen."""
    res = await enhance_letter_ai(
        text=req.text,
        recipient_name=req.recipient_name or "My Love",
        sender_name=req.sender_name or "Yours Always",
        tone=req.tone or "romantic & poetic",
    )
    return {
        "success": True,
        "model": req.model or GROQ_MODEL,
        **res,
    }

@app.post("/api/ai/suggest-captions")
async def suggest_captions(req: AICaptionsRequest):
    """Generates creative captions, chapter titles, and romantic locations."""
    captions = await suggest_captions_ai(
        recipient_name=req.recipient_name or "My Love",
        occasion=req.occasion or "anniversary",
        count=req.count or 5,
        context_hints=req.context_hints or "",
    )
    return {
        "success": True,
        "model": req.model or GROQ_MODEL,
        "captions": captions,
    }

@app.post("/api/ai/suggest-proposal")
async def suggest_proposal(req: AIProposalRequest):
    """Generates surprise / proposal questions."""
    proposals = await suggest_proposals_ai(
        recipient_name=req.recipient_name or "My Love",
        sender_name=req.sender_name or "Yours Always",
        tone=req.tone or "romantic",
    )
    return {
        "success": True,
        "model": GROQ_MODEL,
        "proposals": proposals,
    }

@app.post("/api/ai/suggest-reasons")
async def suggest_reasons(req: AIReasonsRequest):
    """Generates reasons why I adore you."""
    reasons = await suggest_reasons_ai(
        recipient_name=req.recipient_name or "My Love",
        sender_name=req.sender_name or "Yours Always",
        count=req.count or 5,
    )
    return {
        "success": True,
        "model": GROQ_MODEL,
        "reasons": reasons,
    }

