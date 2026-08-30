"use client";

import React, { useState, useEffect } from "react";
import ParticleBackground from "../components/ParticleBackground";
import AudioSynthesizer from "../components/AudioSynthesizer";
import DaysCounter from "../components/DaysCounter";
import PolaroidGallery from "../components/PolaroidGallery";
import MemoryBook from "../components/MemoryBook";
import LoveLetterModal from "../components/LoveLetterModal";
import ConfigModal from "../components/ConfigModal";
import InstantGiftWizard from "../components/InstantGiftWizard";
import { GalleryConfig } from "../types/gallery";

const INITIAL_CONFIG: GalleryConfig = {
  recipient_name: "My Love",
  sender_name: "Yours Always",
  anniversary_date: "2023-02-14",
  title: "Our Eternal Journey",
  letter: "From the very first moment we met to every quiet laugh we share, every memory with you is my favorite chapter. Thank you for making every single day feel magical and unforgettable.",
  music_theme: "romantic_piano",
  photos: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
      caption: "Where our story began - our first magical walk",
      date: "Chapter 1",
      location: "Sunset Boulevard",
      rotation: -3,
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80",
      caption: "Your laugh that made my whole world stop",
      date: "Chapter 2",
      location: "Coffee & Rainy Days",
      rotation: 4,
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
      caption: "Holding hands beneath a thousand city lights",
      date: "Chapter 3",
      location: "City Skyline",
      rotation: -2,
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop&q=80",
      caption: "Golden hour smiles & sweet whispers",
      date: "Chapter 4",
      location: "Beachside Vista",
      rotation: 3,
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80",
      caption: "To forever and all our unwritten adventures",
      date: "Chapter 5",
      location: "Into Tomorrow",
      rotation: -4,
    },
  ],
};

export default function Home() {
  const [config, setConfig] = useState<GalleryConfig>(INITIAL_CONFIG);
  const [activeTab, setActiveTab] = useState<"polaroids" | "storybook">("polaroids");
  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [secretRevealed, setSecretRevealed] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check URL parameters for custom shared gift link
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const giftParam = params.get("gift");
      if (giftParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(giftParam)));
          setConfig(decoded);
          return;
        } catch {
          console.error("Could not parse shared gift configuration");
        }
      }

      // 2. Fetch latest saved state from FastAPI backend or fallback to localStorage
      fetch("/api/backend/gallery")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Backend not available");
        })
        .then((data) => {
          if (data && data.photos && data.photos.length > 0) {
            setConfig(data);
          }
        })
        .catch(() => {
          const local = localStorage.getItem("picsframe_custom_config");
          if (local) {
            try {
              setConfig(JSON.parse(local));
            } catch {
              // ignore
            }
          }
        });
    }
  }, []);

  const handleSaveConfig = async (newConfig: GalleryConfig) => {
    setConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem("picsframe_custom_config", JSON.stringify(newConfig));
    }
    // Attempt saving to FastAPI backend
    try {
      await fetch("/api/backend/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
    } catch {
      // Backend is optional; local storage persists
    }
  };

  const handleCopyShareLink = () => {
    try {
      const jsonStr = JSON.stringify(config);
      const encoded = btoa(encodeURIComponent(jsonStr));
      const url = `${window.location.origin}${window.location.pathname}?gift=${encoded}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      alert("Gift link ready! You can share this page URL.");
    }
  };

  return (
    <div className="app-viewport">
      {/* Background Animated Atmosphere */}
      <ParticleBackground />

      {/* Floating Audio Ambient Soundtrack */}
      <AudioSynthesizer />

      {/* Top Floating Glass Navigation */}
      <header className="glass-nav">
        <div className="nav-logo">
          <span className="heart-icon">💖</span>
          <span className="brand-text">{config.title}</span>
        </div>
        <div className="nav-actions">
          <button
            className="gift-btn wizard-nav-btn"
            onClick={() => setIsWizardOpen(true)}
            title="Upload photos & generate ready gift"
          >
            🚀 Boom Ready Creator
          </button>
          <button
            className="gift-btn letter-nav-btn"
            onClick={() => setIsLetterOpen(true)}
            title="Open Secret Letter"
          >
            💌 Love Letter
          </button>
          <button
            className="gift-btn customize-nav-btn"
            onClick={() => setIsConfigOpen(true)}
            title="Fine-tune with your own photos & details"
          >
            ⚙️ Edit
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-badge">A Timeless Keepsake</div>
          <h1 className="hero-title">
            For My Dearest <span className="highlight-text">{config.recipient_name}</span>
          </h1>
          <p className="hero-subtitle">
            Every moment captured in our frame is a constellation of memories we created together.
          </p>

          {/* Quick Action Bar for Instant Creation & Sharing */}
          <div className="hero-cta-banner">
            <button
              className="magic-create-cta"
              onClick={() => setIsWizardOpen(true)}
            >
              🪄 Upload Photos & Boom Ready Gift
            </button>
            <button
              className="share-gift-cta"
              onClick={handleCopyShareLink}
            >
              {copiedLink ? "✓ Copied Shareable Gift Link!" : "🔗 Share This Gift With Her"}
            </button>
          </div>

          {/* Real-time Days & Hours Counter */}
          <DaysCounter
            startDateStr={config.anniversary_date}
            recipientName={config.recipient_name}
          />
        </section>

        {/* View Switcher Tabs */}
        <div className="view-switch-bar">
          <button
            className={`switch-tab ${activeTab === "polaroids" ? "active" : ""}`}
            onClick={() => setActiveTab("polaroids")}
          >
            📸 Floating Polaroids Gallery
          </button>
          <button
            className={`switch-tab ${activeTab === "storybook" ? "active" : ""}`}
            onClick={() => setActiveTab("storybook")}
          >
            📖 3D Storybook Album
          </button>
        </div>

        {/* Dynamic Display Area */}
        <section className="gallery-container">
          {activeTab === "polaroids" ? (
            <PolaroidGallery photos={config.photos} recipientName={config.recipient_name} />
          ) : (
            <MemoryBook
              photos={config.photos}
              recipientName={config.recipient_name}
              senderName={config.sender_name}
            />
          )}
        </section>

        {/* Secret Love Message Box */}
        <section className="secret-card-section">
          <div className="secret-card">
            <div className="secret-card-inner">
              <span className="card-sparkle">✨</span>
              <h3 className="secret-card-title">A Little Secret For You</h3>
              <p className="secret-card-desc">
                {secretRevealed
                  ? config.letter
                  : "Click the button below to reveal the personal message written just for you."}
              </p>
              <button
                className="reveal-btn"
                onClick={() => setSecretRevealed(!secretRevealed)}
              >
                {secretRevealed ? "Hide Secret Message 🔒" : "Unlock Secret Message 🗝️"}
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="gift-footer">
          <div className="footer-heart">♥</div>
          <p>
            Handcrafted with love by <strong className="sender-strong">{config.sender_name}</strong> for{" "}
            <strong className="recipient-strong">{config.recipient_name}</strong>
          </p>
          <div className="footer-share-hint">
            💡 Want to create one for your girlfriend? Click{" "}
            <button className="inline-link" onClick={() => setIsWizardOpen(true)}>
              Boom Ready Creator
            </button>{" "}
            to upload 4–5 photos and get your custom gift in seconds.
          </div>
          <div className="creator-credit-badge">
            ⚡ Engineered with ❤️ by <a href="https://focitech.in" target="_blank" rel="noopener noreferrer" className="credit-author">Deepesh Sharma</a> (CTO & Co-Founder, <strong className="credit-company">FociTech</strong>)
          </div>
        </footer>
      </main>

      {/* Boom Ready Creator Wizard */}
      <InstantGiftWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleSaveConfig}
      />

      {/* Love Letter Modal */}
      <LoveLetterModal
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
        recipientName={config.recipient_name}
        senderName={config.sender_name}
        letterContent={config.letter}
      />

      {/* Customizer Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
