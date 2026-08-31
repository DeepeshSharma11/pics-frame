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
import SurpriseProposalModal from "../components/SurpriseProposalModal";
import LoveReasonsSection from "../components/LoveReasonsSection";
import { supabase } from "../lib/supabase";
import { GalleryConfig } from "../types/gallery";

const INITIAL_CONFIG: GalleryConfig = {
  recipient_name: "My Love",
  sender_name: "Yours Always",
  anniversary_date: "2023-02-14",
  title: "Our Eternal Journey",
  letter: "From the very first moment we met to every quiet laugh we share, every memory with you is my favorite chapter. Thank you for making every single day feel magical and unforgettable.",
  music_theme: "romantic_piano",
  theme: "rose",
  particle_type: "hearts",
  occasion_type: "anniversary",
  surprise_message: "Will you be mine forever & always? 💍✨",
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
  const [isProposalOpen, setIsProposalOpen] = useState<boolean>(false);
  const [secretRevealed, setSecretRevealed] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      // 1. Check for Supabase Cloud Gift ID (?id=...)
      const idParam = params.get("id");
      if (idParam) {
        const fetchCloudGift = async () => {
          try {
            const { data, error } = await supabase
              .from("galleries")
              .select("*")
              .eq("slug", idParam)
              .single();
            if (data && !error) {
              setConfig({
                recipient_name: data.recipient_name || "My Love",
                sender_name: data.sender_name || "Yours Always",
                anniversary_date: data.anniversary_date || "2023-02-14",
                title: data.title || "Our Eternal Journey",
                letter: data.letter || "",
                music_theme: data.music_theme || "romantic_piano",
                theme: data.theme || "rose",
                particle_type: data.particle_type || "hearts",
                occasion_type: data.occasion_type || "anniversary",
                surprise_message: data.surprise_message || "",
                photos: data.photos || [],
              });
            }
          } catch {
            // Fallback
          }
        };
        fetchCloudGift();
        return;
      }

      // 2. Check for Base64 encoded gift parameter (?gift=...)
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

      // 3. Fetch latest state from backend or fallback to localStorage
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

  const saveToSupabaseCloud = async (cfg: GalleryConfig): Promise<string | null> => {
    try {
      const slug = Math.random().toString(36).substring(2, 9);
      const { error } = await supabase.from("galleries").insert([
        {
          slug,
          recipient_name: cfg.recipient_name,
          sender_name: cfg.sender_name,
          anniversary_date: cfg.anniversary_date,
          title: cfg.title,
          letter: cfg.letter,
          music_theme: cfg.music_theme,
          theme: cfg.theme,
          particle_type: cfg.particle_type,
          occasion_type: cfg.occasion_type,
          surprise_message: cfg.surprise_message,
          photos: cfg.photos,
        },
      ]);
      if (!error) return slug;
    } catch {
      // Fallback
    }
    return null;
  };

  const handleSaveConfig = async (newConfig: GalleryConfig) => {
    setConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem("picsframe_custom_config", JSON.stringify(newConfig));
    }
    // Attempt saving to Supabase
    saveToSupabaseCloud(newConfig);

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

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    // 1. Try modern navigator.clipboard
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // continue to fallback
      }
    }

    // 2. Robust fallback for mobile: temporary textarea
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) return true;
    } catch {
      // continue to fallback
    }

    return false;
  };

  const handleCopyShareLink = async () => {
    setIsGeneratingLink(true);

    try {
      // 1. Try Supabase cloud short link first
      let shareUrl = "";
      const slug = await saveToSupabaseCloud(config);
      if (slug) {
        shareUrl = `${window.location.origin}${window.location.pathname}?id=${slug}`;
      } else {
        // 2. Fallback to base64 param
        const jsonStr = JSON.stringify(config);
        const encoded = btoa(encodeURIComponent(jsonStr));
        shareUrl = `${window.location.origin}${window.location.pathname}?gift=${encoded}`;
      }

      // 3. Try Native Web Share API on mobile (Direct WhatsApp/Instagram/Telegram share)
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: `A Special Memory Gift For ${config.recipient_name} ❤️`,
            text: `I made something special for you! Open our memories here ✨:`,
            url: shareUrl,
          });
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 4000);
          setIsGeneratingLink(false);
          return;
        } catch (err: any) {
          if (err.name === "AbortError") {
            setIsGeneratingLink(false);
            return;
          }
        }
      }

      // 4. Fallback to Clipboard Copy
      const copied = await copyTextToClipboard(shareUrl);
      if (copied) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 4000);
      } else {
        // 5. Final fallback: prompt modal
        prompt("Your gift link is ready! Copy the link below:", shareUrl);
      }
    } catch {
      alert("Gift link ready! You can copy the page address from your browser.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const occasionLabel =
    config.occasion_type === "birthday"
      ? "🎂 Birthday Celebration"
      : config.occasion_type === "proposal"
      ? "💍 Love Proposal"
      : config.occasion_type === "valentine"
      ? "🌹 Valentine's Special"
      : "✨ A Timeless Keepsake";

  return (
    <div className={`app-viewport theme-${config.theme || "rose"}`}>
      {/* Background Animated Atmosphere */}
      <ParticleBackground
        particleType={config.particle_type || "hearts"}
        theme={config.theme || "rose"}
      />

      {/* Floating Audio Ambient Soundtrack */}
      <AudioSynthesizer musicTheme={config.music_theme || "romantic_piano"} />

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
            className="gift-btn surprise-nav-btn"
            onClick={() => setIsProposalOpen(true)}
            title="Open Special Question / Surprise"
          >
            💍 Surprise
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
          <div className="hero-badge">{occasionLabel}</div>
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
              disabled={isGeneratingLink}
            >
              {isGeneratingLink
                ? "⏳ Generating Link..."
                : copiedLink
                ? "✓ Copied / Shared Successfully!"
                : "🔗 Share This Gift With Her"}
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

        {/* Interactive Reasons Why I Adore You */}
        <LoveReasonsSection
          reasons={config.reasons}
          recipientName={config.recipient_name}
        />

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

      {/* Surprise Proposal Modal */}
      <SurpriseProposalModal
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        recipientName={config.recipient_name}
        senderName={config.sender_name}
        occasionType={config.occasion_type}
        surpriseMessage={config.surprise_message}
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
