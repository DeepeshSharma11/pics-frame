"use client";

import React, { useState, useEffect, useRef } from "react";

export default function AudioSynthesizer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

  const playNote = (ctx: AudioContext, freq: number, duration: number = 2.2) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const startMusic = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    const ctx = audioCtxRef.current;
    setIsPlaying(true);

    let step = 0;
    const progression = [
      [261.63, 329.63, 523.25],
      [329.63, 392.00, 659.25],
      [220.00, 261.63, 440.00],
      [174.61, 261.63, 349.23],
    ];

    intervalRef.current = setInterval(() => {
      if (!ctx || ctx.state !== "running") return;
      const currentChord = progression[step % progression.length];
      step++;

      currentChord.forEach((f, idx) => {
        setTimeout(() => {
          if (ctx.state === "running") playNote(ctx, f, 2.5);
        }, idx * 260);
      });

      if (Math.random() > 0.35) {
        setTimeout(() => {
          const randFreq = notes[Math.floor(Math.random() * notes.length)];
          if (ctx.state === "running") playNote(ctx, randFreq, 1.8);
        }, 700 + Math.random() * 500);
      }
    }, 2400);
  };

  const stopMusic = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <button
      onClick={toggleMusic}
      className={`audio-fab ${isPlaying ? "playing" : ""}`}
      title={isPlaying ? "Mute Ambient Soundtrack" : "Play Ambient Soundtrack"}
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 50,
        background: isPlaying ? "rgba(219, 39, 119, 0.4)" : "rgba(22, 17, 34, 0.92)",
        border: "1px solid rgba(244, 114, 182, 0.35)",
        borderRadius: "40px",
        padding: "8px 14px",
        color: "#fbcfe8",
        fontSize: "0.8rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
      }}
    >
      <span style={{ fontSize: "1rem" }}>{isPlaying ? "🎵" : "🔇"}</span>
      <span>{isPlaying ? "Playing" : "Ambiance"}</span>
      {isPlaying && (
        <span className="sound-wave">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </span>
      )}
    </button>
  );
}
