"use client";

import React, { useState } from "react";
import { PhotoItem } from "../types/gallery";

interface PolaroidGalleryProps {
  photos: PhotoItem[];
  recipientName: string;
}

export default function PolaroidGallery({ photos, recipientName }: PolaroidGalleryProps) {
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [likedList, setLikedList] = useState<{ [key: string]: boolean }>({});

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const current = likes[id] || 0;
    const isLiked = likedList[id];
    setLikes({ ...likes, [id]: isLiked ? current - 1 : current + 1 });
    setLikedList({ ...likedList, [id]: !isLiked });
  };

  return (
    <div className="polaroid-section">
      <div className="section-header">
        <h2 className="section-title">Framed in Time</h2>
        <p className="section-subtitle">
          Hover and click on our captured memories to view every tiny detail
        </p>
      </div>

      <div className="polaroid-grid">
        {photos.map((photo, index) => {
          const rotationDeg = photo.rotation !== undefined ? photo.rotation : (index % 2 === 0 ? -3 : 3);
          const isLiked = likedList[photo.id];
          const count = likes[photo.id] || (index * 7 + 12);

          return (
            <div
              key={photo.id}
              className="polaroid-card"
              style={{
                transform: `rotate(${rotationDeg}deg)`,
                animationDelay: `${index * 0.15}s`,
              }}
              onClick={() => setActivePhoto(photo)}
            >
              <div className="polaroid-pin">📌</div>
              <div className="polaroid-image-wrapper">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="polaroid-img"
                  loading="lazy"
                />
                <div className="polaroid-glow-overlay" />
              </div>
              <div className="polaroid-footer">
                <div className="polaroid-caption">{photo.caption}</div>
                <div className="polaroid-meta">
                  <span className="polaroid-date">{photo.date}</span>
                  {photo.location && (
                    <span className="polaroid-location">📍 {photo.location}</span>
                  )}
                  <button
                    className={`like-btn ${isLiked ? "active" : ""}`}
                    onClick={(e) => handleLike(e, photo.id)}
                    title="Send Love"
                  >
                    <span>{isLiked ? "💖" : "🤍"}</span>
                    <span className="like-count">{count}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="lightbox-backdrop" onClick={() => setActivePhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setActivePhoto(null)}>
              ✕
            </button>
            <div className="lightbox-image-container">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption}
                className="lightbox-img"
              />
            </div>
            <div className="lightbox-details">
              <div className="lightbox-tag">{activePhoto.date}</div>
              <h3 className="lightbox-title">{activePhoto.caption}</h3>
              {activePhoto.location && (
                <p className="lightbox-loc">📍 {activePhoto.location}</p>
              )}
              <p className="lightbox-love-quote">
                &ldquo;Every second by your side is written into the stars, {recipientName}.&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
