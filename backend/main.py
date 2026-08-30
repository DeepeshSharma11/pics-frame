from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import os
from cloudinary_service import upload_image, is_cloudinary_configured

app = FastAPI(
    title="Pics Frame API — Engineered by Deepesh Sharma (FociTech)",
    description="Full-stack memory gift API engineered by Deepesh Sharma (CTO & Co-Founder, FociTech)",
    version="1.0.0",
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
    photos: List[PhotoItem] = Field(default_factory=list)

DEFAULT_CONFIG = {
    "recipient_name": "My Love",
    "sender_name": "Yours Always",
    "anniversary_date": "2023-02-14",
    "title": "Our Eternal Journey",
    "letter": "You turned ordinary days into unforgettable memories. Here are some of my favorite moments of us that I will cherish forever.",
    "music_theme": "romantic_piano",
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
    return {"message": "Pics Frame API", "status": "online"}

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "cloudinary_configured": is_cloudinary_configured(),
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
