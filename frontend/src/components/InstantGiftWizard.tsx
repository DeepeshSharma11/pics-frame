"use client";

import React, { useState, useRef } from "react";
import { GalleryConfig, PhotoItem, ThemeType, ParticleType, OccasionType } from "../types/gallery";
import {
  aiWriteLetter,
  aiEnhanceLetter,
  aiSuggestCaptions,
  aiSuggestProposal,
  GROQ_MODEL,
} from "../lib/aiService";

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
  const [occasionType, setOccasionType] = useState<OccasionType>("anniversary");
  const [theme, setTheme] = useState<ThemeType>("rose");
  const [particleType, setParticleType] = useState<ParticleType>("hearts");
  const [musicTheme, setMusicTheme] = useState<string>("romantic_piano");
  const [surpriseMessage, setSurpriseMessage] = useState<string>("");
  const [letter, setLetter] = useState<string>(
    "From the very first moment we met, every memory with you has been my favorite chapter. Thank you for making my world so bright and beautiful."
  );
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [boomState, setBoomState] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Assistant States (Groq Qwen 3.8-27b)
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiTone, setAiTone] = useState<string>("Deep & Poetic");
  const [aiMemoryDetails, setAiMemoryDetails] = useState<string>("");
  const [showAiStoryBox, setShowAiStoryBox] = useState<boolean>(false);
  const [proposalSuggestions, setProposalSuggestions] = useState<string[]>([]);


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
      setUploadProgress(`Optimizing ${i + 1} of ${files.length}...`);
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

  // AI Handlers using Groq Qwen (qwen/qwen3.8-27b)
  const handleAIAutoCaptions = async () => {
    if (uploadedPhotos.length === 0) return;
    setAiLoading("captions");
    try {
      const results = await aiSuggestCaptions({
        recipient_name: recipientName || "My Love",
        occasion: occasionType,
        count: uploadedPhotos.length,
        context_hints: aiMemoryDetails,
      });

      const updated = uploadedPhotos.map((p, idx) => {
        const item = results[idx] || results[idx % results.length];
        return {
          ...p,
          caption: item?.caption || p.caption,
          date: item?.chapter || p.date,
          location: item?.location || p.location,
        };
      });
      setUploadedPhotos(updated);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIWriteLetter = async () => {
    setAiLoading("letter");
    try {
      const res = await aiWriteLetter({
        recipient_name: recipientName || "My Love",
        sender_name: senderName || "Yours Always",
        occasion: occasionType,
        tone: aiTone,
        key_details: aiMemoryDetails,
        relationship_date: anniversaryDate,
      });
      if (res.letter) {
        setLetter(res.letter);
      }
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIEnhanceLetter = async () => {
    if (!letter.trim()) return;
    setAiLoading("enhance");
    try {
      const enhanced = await aiEnhanceLetter({
        text: letter,
        recipient_name: recipientName || "My Love",
        sender_name: senderName || "Yours Always",
        tone: aiTone,
      });
      if (enhanced) {
        setLetter(enhanced);
      }
    } finally {
      setAiLoading(null);
    }
  };

  const handleAISuggestProposal = async () => {
    setAiLoading("proposal");
    try {
      const suggestions = await aiSuggestProposal(
        recipientName || "My Love",
        senderName || "Yours Always"
      );
      setProposalSuggestions(suggestions);
    } finally {
      setAiLoading(null);
    }
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
      music_theme: musicTheme,
      theme,
      particle_type: particleType,
      occasion_type: occasionType,
      surprise_message: surpriseMessage.trim(),
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
          <div className="wizard-badge">🪄 3-Step Romantic Gift Creator</div>
          <h2 className="wizard-title">
            {step === 1 && "Step 1: Upload 4–5 Special Photos"}
            {step === 2 && "Step 2: Names, Occasion & AI Love Letter"}
            {step === 3 && "Step 3: Magic Theme & Atmosphere"}
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
                  Auto-compressed for instant loading. Supports JPG, PNG, WEBP.
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
                  <div className="preview-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <span>Uploaded Photos ({uploadedPhotos.length})</span>
                    <button
                      type="button"
                      className="ai-magic-btn"
                      onClick={handleAIAutoCaptions}
                      disabled={aiLoading === "captions"}
                    >
                      {aiLoading === "captions" ? (
                        <span className="ai-loading-pulse">✨ Qwen AI Writing Captions...</span>
                      ) : (
                        "✨ AI Auto-Captions & Story Chapters"
                      )}
                    </button>
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

          {/* STEP 2: NAMES, OCCASION & LETTER */}
          {step === 2 && (
            <div className="wizard-step-content">
              {/* Occasion Selector */}
              <div className="occasion-selector">
                <label className="section-field-label">🎁 What are you celebrating?</label>
                <div className="occasion-buttons">
                  {[
                    { key: "anniversary", label: "🥂 Anniversary / Relationship" },
                    { key: "birthday", label: "🎂 Birthday Celebration" },
                    { key: "proposal", label: "💍 Love Proposal" },
                    { key: "valentine", label: "🌹 Valentine's Day" },
                    { key: "just_because", label: "💖 Just Because I Love You" },
                  ].map((occ) => (
                    <button
                      key={occ.key}
                      type="button"
                      className={`occasion-btn ${occasionType === occ.key ? "active" : ""}`}
                      onClick={() => setOccasionType(occ.key as OccasionType)}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wizard-form-grid">
                <div className="input-group">
                  <label>Partner&apos;s Name / Nickname</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Maya / My Love / Janu"
                  />
                </div>

                <div className="input-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Deepesh / Yours Always"
                  />
                </div>

                <div className="input-group full">
                  <label>Special Date (Relationship / Anniversary / Birthday)</label>
                  <input
                    type="date"
                    value={anniversaryDate}
                    onChange={(e) => setAnniversaryDate(e.target.value)}
                  />
                </div>

                {/* AI Letter Suite Powered by Qwen 3.8-27b */}
                <div className="input-group full">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                    <label style={{ margin: 0 }}>💌 Heartfelt Love Letter</label>
                    <span className="ai-header-badge">✨ Powered by Groq Qwen 27B</span>
                  </div>

                  {/* AI Tone selector */}
                  <div className="ai-tone-selector">
                    {["Deep & Poetic", "Sweet & Romantic", "Playful & Cute", "Emotional", "Celebratory"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`ai-tone-pill ${aiTone === t ? "active" : ""}`}
                        onClick={() => setAiTone(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="ai-actions-bar">
                    <button
                      type="button"
                      className="ai-magic-btn"
                      onClick={handleAIWriteLetter}
                      disabled={aiLoading === "letter"}
                    >
                      {aiLoading === "letter" ? (
                        <span className="ai-loading-pulse">✨ Writing Romantic Letter...</span>
                      ) : (
                        "✨ AI Write From Details"
                      )}
                    </button>

                    <button
                      type="button"
                      className="ai-magic-btn secondary"
                      onClick={handleAIEnhanceLetter}
                      disabled={aiLoading === "enhance" || !letter.trim()}
                    >
                      {aiLoading === "enhance" ? (
                        <span className="ai-loading-pulse">✨ Polishing & Elevating...</span>
                      ) : (
                        "🪄 AI Polish & Enhance"
                      )}
                    </button>

                    <button
                      type="button"
                      className="ai-magic-btn secondary"
                      onClick={() => setShowAiStoryBox(!showAiStoryBox)}
                    >
                      {showAiStoryBox ? "Hide Story Details" : "+ Add Story Details"}
                    </button>
                  </div>

                  {showAiStoryBox && (
                    <div className="ai-detail-box">
                      <label>Optional memories, inside jokes, nicknames, or milestone highlights:</label>
                      <input
                        type="text"
                        value={aiMemoryDetails}
                        onChange={(e) => setAiMemoryDetails(e.target.value)}
                        placeholder="e.g. met at the coffee shop, love our starry night road trips, our favorite song..."
                      />
                    </div>
                  )}

                  <textarea
                    rows={4}
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    placeholder="Write anything sweet, romantic, or funny..."
                  />
                </div>

                <div className="input-group full">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ margin: 0 }}>💍 Surprise Question / Proposal (Optional)</label>
                    <button
                      type="button"
                      className="ai-magic-btn secondary"
                      style={{ padding: "3px 10px", fontSize: "0.72rem" }}
                      onClick={handleAISuggestProposal}
                      disabled={aiLoading === "proposal"}
                    >
                      {aiLoading === "proposal" ? "✨ Thinking..." : "✨ AI Suggest Lines"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={surpriseMessage}
                    onChange={(e) => setSurpriseMessage(e.target.value)}
                    placeholder="e.g. Will you be my forever? 💍 / Happy Birthday Jaan! 🎂"
                  />

                  {proposalSuggestions.length > 0 && (
                    <div className="ai-suggestions-list">
                      {proposalSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="ai-suggestion-item"
                          onClick={() => setSurpriseMessage(s)}
                        >
                          ✦ {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: THEME, PARTICLES & SOUNDTRACK */}
          {step === 3 && (
            <div className="wizard-step-content">
              {/* Color Theme */}
              <div className="custom-option-block">
                <label className="section-field-label">🎨 Aesthetic Color Theme</label>
                <div className="theme-chips">
                  {[
                    { id: "rose", name: "🌸 Velvet Rose Gold" },
                    { id: "obsidian", name: "🖤 Warm Obsidian & Amber" },
                    { id: "sunset", name: "🌅 Golden Sunset" },
                    { id: "emerald", name: "🌿 Emerald Luxury" },
                    { id: "ruby", name: "🍷 Deep Passion Ruby" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`theme-chip ${theme === t.id ? "active" : ""}`}
                      onClick={() => setTheme(t.id as ThemeType)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating Particles */}
              <div className="custom-option-block">
                <label className="section-field-label">✨ Floating Atmosphere Effect</label>
                <div className="particle-chips">
                  {[
                    { id: "hearts", label: "❤️ Floating Hearts" },
                    { id: "petals", label: "🌹 Rose Petals" },
                    { id: "stars", label: "✨ Starlight Sparkles" },
                    { id: "butterflies", label: "🦋 Butterflies" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`particle-chip ${particleType === p.id ? "active" : ""}`}
                      onClick={() => setParticleType(p.id as ParticleType)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soundscape */}
              <div className="custom-option-block">
                <label className="section-field-label">🎵 Romantic Soundscape Ambiance</label>
                <div className="music-chips">
                  {[
                    { id: "romantic_piano", label: "🎹 Romantic Piano Melody" },
                    { id: "lofi", label: "☕ Warm Lo-Fi Chords" },
                    { id: "stardust", label: "🌌 Stardust Music Box" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`music-chip ${musicTheme === m.id ? "active" : ""}`}
                      onClick={() => setMusicTheme(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="boom-summary-card">
                <div className="boom-emoji">{boomState ? "💥✨💖" : "🎁"}</div>
                <h4>{recipientName ? `Ready to Wow ${recipientName}!` : "Ready to Create Magic!"}</h4>
                <p>
                  Assembling {uploadedPhotos.length} photos into 3D Polaroids, Flip Storybook, Real-time Counter & Love Letter.
                </p>
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
              Next: Choose Themes & Music →
            </button>
          )}

          {step === 3 && (
            <button
              className="boom-launch-btn"
              onClick={handleCreateBoom}
              disabled={boomState}
            >
              {boomState ? "✨ Creating Magic..." : "🚀 BOOM READY! Launch Gift"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
