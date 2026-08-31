"use client";

import React, { useState } from "react";

interface LoveReasonsSectionProps {
  reasons?: string[];
  recipientName: string;
}

const DEFAULT_REASONS = [
  "The way your eyes sparkle whenever you laugh genuinely.",
  "How you make even the quietest ordinary moments feel extraordinary.",
  "Your kindness and warmth towards everyone around you.",
  "The unforgettable feeling of holding your hand under city lights.",
  "Because loving you is the easiest and most beautiful thing I've ever done.",
];

export default function LoveReasonsSection({
  reasons = DEFAULT_REASONS,
  recipientName,
}: LoveReasonsSectionProps) {
  const [openedCards, setOpenedCards] = useState<{ [key: number]: boolean }>({ 0: true });

  const activeReasons = reasons && reasons.length > 0 ? reasons : DEFAULT_REASONS;

  const toggleCard = (idx: number) => {
    setOpenedCards((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <section className="reasons-section">
      <div className="section-header">
        <span className="reasons-badge">💌 Pure Love Notes</span>
        <h2 className="section-title">Reasons Why I Adore You</h2>
        <p className="section-subtitle">
          Tap each note to unfold a little reminder of why you mean the universe to me
        </p>
      </div>

      <div className="reasons-grid">
        {activeReasons.map((reason, idx) => {
          const isOpen = !!openedCards[idx];
          return (
            <div
              key={idx}
              className={`reason-card ${isOpen ? "open" : ""}`}
              onClick={() => toggleCard(idx)}
            >
              <div className="reason-header">
                <span className="reason-number">#{idx + 1}</span>
                <span className="reason-icon">{isOpen ? "💖" : "💌"}</span>
              </div>
              <div className="reason-body">
                {isOpen ? (
                  <p className="reason-text">{reason}</p>
                ) : (
                  <span className="reason-hint">Tap to unfold reason #{idx + 1} ✨</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
