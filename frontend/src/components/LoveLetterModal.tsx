"use client";

import React, { useState } from "react";

interface LoveLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  senderName: string;
  letterContent: string;
}

export default function LoveLetterModal({
  isOpen,
  onClose,
  recipientName,
  senderName,
  letterContent,
}: LoveLetterModalProps) {
  const [isSealed, setIsSealed] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div className="letter-modal-backdrop" onClick={onClose}>
      <div className="letter-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-letter-btn" onClick={onClose}>
          ✕
        </button>

        {isSealed ? (
          <div className="envelope-view">
            <div className="wax-seal-badge" onClick={() => setIsSealed(false)}>
              <div className="wax-inner">💌</div>
              <span className="seal-text">Click to Break Wax Seal</span>
            </div>
            <div className="envelope-to">
              <span className="to-label">Handcrafted For</span>
              <h2 className="to-name">{recipientName}</h2>
              <span className="from-label">From {senderName}</span>
            </div>
          </div>
        ) : (
          <div className="letter-paper-view">
            <div className="letter-header">
              <span className="letter-salutation">Dearest {recipientName},</span>
            </div>
            <div className="letter-body">
              <p className="letter-text">{letterContent}</p>
            </div>
            <div className="letter-signature-block">
              <p className="always-text">Forever & Always,</p>
              <h3 className="sender-signature">{senderName}</h3>
              <div className="letter-stamp">❤️ SEALED WITH LOVE</div>
            </div>
            <button className="reseal-btn" onClick={() => setIsSealed(true)}>
              Reseal Envelope
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
