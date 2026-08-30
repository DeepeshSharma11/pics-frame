"use client";

import React, { useState, useRef } from "react";
import { GalleryConfig, PhotoItem } from "../types/gallery";

interface InstantGiftWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: GalleryConfig) => void;
}

export default function InstantGiftWizard({
  isOpen,
  onClose,
  onComplete,
}: InstantGiftWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [recipientName, setRecipientName] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");
  const [anniversaryDate, setAnniversaryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [letter, setLetter] = useState<string>(
    "From the very first moment we met, every memory with you has been my favorite chapter. Thank you for making my world so bright and beautiful."
  );
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [boomState, setBoomState] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const compressImage = (file: File, maxWidth = 900, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = () => resolve("");
    });
  };

  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "indkrlsl";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pics_frame_preset";

    // 1. Try direct Cloudinary unsigned upload
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      if (cldRes.ok) {
        const cldData = await cldRes.json();
        if (cldData.secure_url) return cldData.secure_url;
      }
    } catch {
      // Continue to backend or compression fallback
    }

    // 2. Try backend Cloudinary upload endpoint
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/backend/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch {
      // Fallback
    }

    // 3. Ultra-fast compressed Base64 fallback (< 50KB)
    return await compressImage(file);
  };

  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems: PhotoItem[] = [...uploadedPhotos];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length} to Cloudinary...`);
      const url = await uploadFileToCloudinary(file);
      newItems.push({
        id: String(Date.now() + i),
        url,
        caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || `Memory ${newItems.length + 1}`,
        date: `Chapter ${newItems.length + 1}`,
        location: "Our Special Place",
        rotation: (newItems.length % 2 === 0 ? -3 : 3),
      });
    }

    setUploadedPhotos(newItems);
    setIsUploading(false);
    setUploadProgress("");
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const handleCreateBoom = () => {
    if (uploadedPhotos.length === 0) {
      alert("Please upload at least 1 photo for your memory frame!");
      return;
    }

    setBoomState(true);

    const finalConfig: GalleryConfig = {
      recipient_name: recipientName.trim() || "My Love",
      sender_name: senderName.trim() || "Yours Always",
      anniversary_date: anniversaryDate,
      title: `${recipientName.trim() || "Our"} Eternal Journey`,
      letter: letter.trim(),
      music_theme: "romantic_piano",
      photos: uploadedPhotos,
    };

    setTimeout(() => {
      onComplete(finalConfig);
      setBoomState(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="wizard-backdrop" onClick={onClose}>
      <div className="wizard-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header">
          <div className="wizard-badge">🪄 3-Minute Magic Gift Creator</div>
          <h2 className="wizard-title">
            {step === 1 && "Step 1: Upload Your Favorite Photos"}
            {step === 2 && "Step 2: Add Names & Love Message"}
            {step === 3 && "Step 3: Boom Ready! Review & Launch"}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Wizard Steps Content */}
        <div className="wizard-body">
          {/* STEP 1: UPLOAD PHOTOS */}
          {step === 1 && (
            <div className="wizard-step-content">
              <div
                className="dropzone-box"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="dropzone-icon">📸</div>
                <h3 className="dropzone-title">
                  {isUploading ? uploadProgress : "Click to select 4 to 5 photos"}
                </h3>
                <p className="dropzone-subtitle">
                  Supports JPG, PNG, WEBP. Photos are automatically optimized with Cloudinary CDN.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleMultipleFiles}
                />
                <button
                  type="button"
                  className="upload-trigger-btn"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "+ Choose 4-5 Photos"}
                </button>
              </div>

              {/* Uploaded Photos Preview Grid */}
              {uploadedPhotos.length > 0 && (
                <div className="uploaded-preview-section">
                  <div className="preview-heading">
                    <span>Uploaded Photos ({uploadedPhotos.length})</span>
                    <span className="rec-text">Tip: 4 to 5 photos look best!</span>
                  </div>
                  <div className="preview-grid">
                    {uploadedPhotos.map((p, idx) => (
                      <div key={p.id || idx} className="preview-card">
                        <img src={p.url} alt={p.caption} />
                        <button
                          className="preview-remove-btn"
                          onClick={() => removePhoto(idx)}
                          title="Remove photo"
                        >
                          ✕
                        </button>
                        <input
                          type="text"
                          className="preview-caption-input"
                          value={p.caption}
                          placeholder="Memory note..."
                          onChange={(e) => {
                            const updated = [...uploadedPhotos];
                            updated[idx].caption = e.target.value;
                            setUploadedPhotos(updated);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: NAMES & DATES */}
          {step === 2 && (
            <div className="wizard-step-content">
              <div className="wizard-form-grid">
                <div className="input-group">
                  <label>Her Name / Nickname</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Maya / My Sunshine"
                  />
                </div>

                <div className="input-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Rahul"
                  />
                </div>

                <div className="input-group full">
                  <label>When Did Your Story Begin? (Anniversary Date)</label>
                  <input
                    type="date"
                    value={anniversaryDate}
                    onChange={(e) => setAnniversaryDate(e.target.value)}
                  />
                </div>

                <div className="input-group full">
                  <label>Heartfelt Love Letter / Secret Note</label>
                  <textarea
                    rows={4}
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    placeholder="Write anything sweet, romantic, or funny..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BOOM REVIEW */}
          {step === 3 && (
            <div className="wizard-step-content text-center">
              <div className="boom-hero">
                <div className="boom-emoji">{boomState ? "💥✨💖" : "🎁"}</div>
                <h3 className="boom-title">
                  {boomState
                    ? "BOOM! Creating Your Magic Gift..."
                    : `Ready to surprise ${recipientName || "Her"}?`}
                </h3>
                <p className="boom-desc">
                  We will assemble your {uploadedPhotos.length} photos into floating 3D polaroids, a storybook album, real-time timer, and wax-sealed letter.
                </p>

                <div className="summary-pill-list">
                  <div className="summary-pill">📸 {uploadedPhotos.length} Photos Ready</div>
                  <div className="summary-pill">💖 For: {recipientName || "My Love"}</div>
                  <div className="summary-pill">⏳ Timer Active</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="wizard-footer">
          {step > 1 ? (
            <button
              className="wizard-back-btn"
              onClick={() => setStep(step - 1)}
              disabled={boomState}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              className="wizard-next-btn"
              onClick={() => {
                if (uploadedPhotos.length === 0) {
                  alert("Please upload at least 1 photo to proceed!");
                  return;
                }
                setStep(2);
              }}
            >
              Continue to Details ({uploadedPhotos.length} Photos) →
            </button>
          )}

          {step === 2 && (
            <button
              className="wizard-next-btn"
              onClick={() => setStep(3)}
            >
              Preview & Create Gift →
            </button>
          )}

          {step === 3 && (
            <button
              className="boom-launch-btn"
              onClick={handleCreateBoom}
              disabled={boomState}
            >
              {boomState ? "✨ Magic in Progress..." : "🚀 BOOM READY! Create My Gift"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
