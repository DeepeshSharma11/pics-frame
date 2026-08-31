"use client";

import React, { useState } from "react";

interface SurpriseProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  senderName: string;
  occasionType?: string;
  surpriseMessage?: string;
}

export default function SurpriseProposalModal({
  isOpen,
  onClose,
  recipientName,
  senderName,
  occasionType = "anniversary",
  surpriseMessage,
}: SurpriseProposalModalProps) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const defaultQuestion =
    occasionType === "proposal"
      ? `Will You Marry Me & Be My Forever? 💍`
      : occasionType === "birthday"
      ? `Happy Birthday To My Favorite Person In The World! 🎂🎉`
      : occasionType === "valentine"
      ? `Will You Be My Valentine Today, Tomorrow & Always? 🌹`
      : `You Make Every Single Day Magical! Will You Stay By My Side Forever? 💖`;

  const finalMessage = surpriseMessage || defaultQuestion;

  return (
    <div className="proposal-modal-backdrop" onClick={onClose}>
      <div className="proposal-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="proposal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="proposal-sparkles">✨ 💍 ✨</div>

        <h2 className="proposal-title">
          A Question For You, <span className="highlight-text">{recipientName}</span>
        </h2>

        <p className="proposal-message">{finalMessage}</p>

        {!accepted ? (
          <div className="proposal-actions">
            <button
              className="proposal-yes-btn"
              onClick={() => setAccepted(true)}
            >
              💖 YES! A Million Times YES! 💖
            </button>
          </div>
        ) : (
          <div className="proposal-celebration">
            <div className="celebration-emojis">🎉 🥂 💍 💖 🎆</div>
            <h3 className="celebration-title">Forever & Always!</h3>
            <p className="celebration-subtitle">
              You just made {senderName} the happiest person in the universe!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
