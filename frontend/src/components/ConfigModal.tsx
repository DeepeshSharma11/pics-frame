"use client";

import React, { useState } from "react";
import { GalleryConfig, PhotoItem } from "../types/gallery";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GalleryConfig;
  onSave: (newConfig: GalleryConfig) => void;
}

export default function ConfigModal({
  isOpen,
  onClose,
  config,
  onSave,
}: ConfigModalProps) {
  const [formData, setFormData] = useState<GalleryConfig>(config);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePhotoChange = (index: number, field: keyof PhotoItem, value: string | number) => {
    const updatedPhotos = [...formData.photos];
    updatedPhotos[index] = {
      ...updatedPhotos[index],
      [field]: value,
    };
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          handlePhotoChange(index, "url", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addPhoto = () => {
    const newId = String(Date.now());
    const newPhoto: PhotoItem = {
      id: newId,
      url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
      caption: "New Beautiful Memory",
      date: `Chapter ${formData.photos.length + 1}`,
      location: "Our Favorite Place",
      rotation: Math.floor(Math.random() * 8) - 4,
    };
    setFormData({ ...formData, photos: [...formData.photos, newPhoto] });
  };

  const removePhoto = (index: number) => {
    if (formData.photos.length <= 1) return;
    const updated = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: updated });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleShareLink = () => {
    try {
      const jsonStr = JSON.stringify(formData);
      const encoded = btoa(encodeURIComponent(jsonStr));
      const url = `${window.location.origin}${window.location.pathname}?gift=${encoded}`;
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch {
      alert("Config saved! You can also save directly to server.");
    }
  };

  return (
    <div className="config-modal-backdrop" onClick={onClose}>
      <div className="config-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="config-header">
          <h2 className="config-title">✨ Customize Your Memory Gift</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="config-desc">
          Personalize this memory frame webapp for your partner. Upload photos, change names, anniversary dates, and love letter.
        </p>

        <div className="config-scroll-area">
          {/* General Details */}
          <div className="config-section">
            <h3 className="section-label">1. Story Details</h3>
            <div className="input-row">
              <div className="input-group">
                <label>Partner&apos;s Name</label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  placeholder="e.g. Emily / My Love"
                />
              </div>
              <div className="input-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={formData.sender_name}
                  onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                  placeholder="e.g. Alex"
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Special Date / Anniversary</label>
                <input
                  type="date"
                  value={formData.anniversary_date}
                  onChange={(e) => setFormData({ ...formData, anniversary_date: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Gift Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Our Love Story"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Love Letter & Message</label>
              <textarea
                rows={4}
                value={formData.letter}
                onChange={(e) => setFormData({ ...formData, letter: e.target.value })}
                placeholder="Write your secret heartfelt message..."
              />
            </div>
          </div>

          {/* Photos Management */}
          <div className="config-section">
            <div className="section-label-row">
              <h3 className="section-label">2. Photos & Moments ({formData.photos.length})</h3>
              <button className="add-photo-btn" onClick={addPhoto}>
                + Add Another Photo
              </button>
            </div>

            <div className="photos-edit-list">
              {formData.photos.map((photo, idx) => (
                <div key={photo.id || idx} className="photo-edit-card">
                  <div className="photo-preview-thumb">
                    <img src={photo.url} alt={`Preview ${idx + 1}`} />
                  </div>
                  <div className="photo-edit-fields">
                    <div className="input-row">
                      <div className="input-group full">
                        <label>Upload Image file or Paste URL</label>
                        <div className="file-input-wrapper">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(idx, e)}
                            className="file-picker"
                          />
                          <input
                            type="text"
                            value={photo.url.startsWith("data:") ? "(Custom Uploaded Image)" : photo.url}
                            onChange={(e) => handlePhotoChange(idx, "url", e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="input-row">
                      <div className="input-group">
                        <label>Caption / Memory Note</label>
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => handlePhotoChange(idx, "caption", e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Date / Tag</label>
                        <input
                          type="text"
                          value={photo.date}
                          onChange={(e) => handlePhotoChange(idx, "date", e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Location (Optional)</label>
                        <input
                          type="text"
                          value={photo.location || ""}
                          onChange={(e) => handlePhotoChange(idx, "location", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {formData.photos.length > 1 && (
                    <button
                      className="delete-photo-btn"
                      onClick={() => removePhoto(idx)}
                      title="Remove this photo"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="config-footer">
          <button className="share-btn" onClick={handleShareLink}>
            {copySuccess ? "✓ Gift Link Copied!" : "🔗 Generate Shareable Link"}
          </button>
          <div className="footer-right">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              Save & Apply Gift
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
