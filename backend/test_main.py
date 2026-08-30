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

    # Reset
    reset_res = client.post("/api/gallery/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["recipient_name"] == DEFAULT_CONFIG["recipient_name"]
    print("[PASS] POST /api/gallery/reset endpoint OK")

    print("All backend tests passed successfully!")

if __name__ == "__main__":
    test_endpoints()
