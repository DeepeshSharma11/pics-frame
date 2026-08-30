import os
import base64
from urllib.parse import urlparse
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

load_dotenv()

CLOUDINARY_URL = os.getenv("CLOUDINARY_URL", "")
CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

# Parse CLOUDINARY_URL if provided
if CLOUDINARY_URL and CLOUDINARY_URL.startswith("cloudinary://"):
    try:
        parsed = urlparse(CLOUDINARY_URL)
        API_KEY = parsed.username or API_KEY
        API_SECRET = parsed.password or API_SECRET
        CLOUD_NAME = parsed.hostname or CLOUD_NAME
    except Exception:
        pass

if CLOUD_NAME and API_KEY and API_SECRET:
    cloudinary.config(
        cloud_name=CLOUD_NAME,
        api_key=API_KEY,
        api_secret=API_SECRET,
        secure=True,
    )

def is_cloudinary_configured() -> bool:
    return bool(CLOUD_NAME and API_KEY and API_SECRET and CLOUD_NAME != "your_cloud_name")

def upload_image(file_bytes: bytes, filename: str = "memory_photo") -> str:
    """
    Uploads an image file to Cloudinary if configured.
    Falls back gracefully to Base64 data URL if Cloudinary upload fails.
    """
    if is_cloudinary_configured():
        try:
            result = cloudinary.uploader.upload(
                file_bytes,
                folder="pics_frame_memories",
                resource_type="image",
            )
            return result.get("secure_url") or result.get("url")
        except Exception as e:
            print(f"[Cloudinary Warning] Cloudinary upload ({e}), using Base64 fallback.")

    encoded = base64.b64encode(file_bytes).decode("utf-8")
    ext = "jpeg"
    if filename.lower().endswith(".png"):
        ext = "png"
    elif filename.lower().endswith(".webp"):
        ext = "webp"
    elif filename.lower().endswith(".gif"):
        ext = "gif"
    return f"data:image/{ext};base64,{encoded}"
