import io
from fastapi.testclient import TestClient
from main import app, DEFAULT_CONFIG

client = TestClient(app)

# Real minimal 1x1 valid PNG image bytes
TINY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00"
    b"\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
)

def test_endpoints():
    response = client.get("/")
    assert response.status_code == 200
    print("[PASS] GET / endpoint OK")

    response_health = client.get("/api/health")
    assert response_health.status_code == 200
    print("[PASS] GET /api/health endpoint OK (Cloudinary status:", response_health.json().get("cloudinary_configured"), ")")

    response_gallery = client.get("/api/gallery")
    assert response_gallery.status_code == 200
    gallery_data = response_gallery.json()
    assert "photos" in gallery_data
    assert len(gallery_data["photos"]) >= 4
    print("[PASS] GET /api/gallery endpoint OK (loaded", len(gallery_data["photos"]), "photos)")

    # Test file upload with real image bytes
    upload_res = client.post(
        "/api/upload",
        files={"file": ("pixel.png", io.BytesIO(TINY_PNG), "image/png")}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["success"] is True
    assert "url" in upload_data
    print("[PASS] POST /api/upload endpoint OK -> URL:", upload_data["url"][:60], "...")

    # Test update
    gallery_data["recipient_name"] = "Sarah"
    update_res = client.post("/api/gallery", json=gallery_data)
    assert update_res.status_code == 200
    assert update_res.json()["recipient_name"] == "Sarah"
    print("[PASS] POST /api/gallery endpoint OK")

    # Test AI write letter
    ai_write_res = client.post(
        "/api/ai/write-letter",
        json={
            "recipient_name": "Maya",
            "sender_name": "Deepesh",
            "occasion": "anniversary",
            "tone": "romantic",
            "key_details": "first coffee date at Starbucks",
        },
    )
    assert ai_write_res.status_code == 200
    ai_write_data = ai_write_res.json()
    assert "letter" in ai_write_data
    assert "title" in ai_write_data
    print("[PASS] POST /api/ai/write-letter OK -> Title:", ai_write_data["title"])

    # Test AI enhance letter
    ai_enhance_res = client.post(
        "/api/ai/enhance-letter",
        json={"text": "I love you so much and you make me smile.", "recipient_name": "Maya"},
    )
    assert ai_enhance_res.status_code == 200
    assert "enhanced_text" in ai_enhance_res.json()
    print("[PASS] POST /api/ai/enhance-letter OK")

    # Test AI captions
    ai_cap_res = client.post(
        "/api/ai/suggest-captions",
        json={"recipient_name": "Maya", "count": 3},
    )
    assert ai_cap_res.status_code == 200
    assert len(ai_cap_res.json()["captions"]) >= 3
    print("[PASS] POST /api/ai/suggest-captions OK")

    # Test AI proposal
    ai_prop_res = client.post(
        "/api/ai/suggest-proposal",
        json={"recipient_name": "Maya"},
    )
    assert ai_prop_res.status_code == 200
    assert len(ai_prop_res.json()["proposals"]) > 0
    print("[PASS] POST /api/ai/suggest-proposal OK")

    # Test AI reasons
    ai_reas_res = client.post(
        "/api/ai/suggest-reasons",
        json={"recipient_name": "Maya", "count": 5},
    )
    assert ai_reas_res.status_code == 200
    assert len(ai_reas_res.json()["reasons"]) > 0
    print("[PASS] POST /api/ai/suggest-reasons OK")

    # Reset
    reset_res = client.post("/api/gallery/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["recipient_name"] == DEFAULT_CONFIG["recipient_name"]
    print("[PASS] POST /api/gallery/reset endpoint OK")

    print("All backend tests passed successfully!")

if __name__ == "__main__":
    test_endpoints()

