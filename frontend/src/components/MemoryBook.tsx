"use client";

import React, { useState } from "react";
import { PhotoItem } from "../types/gallery";

interface MemoryBookProps {
  photos: PhotoItem[];
  recipientName: string;
  senderName: string;
}

export default function MemoryBook({ photos, recipientName, senderName }: MemoryBookProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);

  const nextPage = () => {
    if (currentPage < photos.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const activePhoto = photos[currentPage] || photos[0];

  return (
    <div className="book-section">
      <div className="section-header">
        <h2 className="section-title">The Book of Us</h2>
        <p className="section-subtitle">
          Chapter {currentPage + 1} of {photos.length} — A Journey Dedicated to {recipientName}
        </p>
      </div>

      <div className="book-container">
        <div className="book-spine"></div>
        <div className="book-page left-page">
          <div className="page-inner">
            <div className="photo-frame-emboss">
              <img
                src={activePhoto?.url}
                alt={activePhoto?.caption}
                className="book-photo"
              />
              <div className="frame-gold-border"></div>
            </div>
            <div className="page-number-left">#{currentPage + 1}</div>
          </div>
        </div>

        <div className="book-page right-page">
          <div className="page-inner story-content">
            <div className="chapter-header">
              <span className="chapter-label">{activePhoto?.date || `Chapter ${currentPage + 1}`}</span>
              <h3 className="chapter-title">{activePhoto?.caption}</h3>
              {activePhoto?.location && (
                <span className="chapter-location">📍 {activePhoto?.location}</span>
              )}
            </div>

            <div className="story-divider">❦</div>

            <p className="story-text">
              Looking back at this moment brings the warmest smile to my heart. With every step we take together,
              life becomes brighter, softer, and filled with endless wonder.
            </p>

            <div className="story-footer">
              <span className="story-signature">With all my love, {senderName}</span>
            </div>
            <div className="page-number-right">Page {currentPage + 1}</div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="book-controls">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="book-nav-btn prev-btn"
        >
          ← Previous Memory
        </button>
        <div className="page-indicators">
          {photos.map((_, idx) => (
            <button
              key={idx}
              className={`page-dot ${currentPage === idx ? "active" : ""}`}
              onClick={() => setCurrentPage(idx)}
              aria-label={`Jump to page ${idx + 1}`}
            />
          ))}
        </div>
        <button
          onClick={nextPage}
          disabled={currentPage === photos.length - 1}
          className="book-nav-btn next-btn"
        >
          Next Memory →
        </button>
      </div>
    </div>
  );
}
