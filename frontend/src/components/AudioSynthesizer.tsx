"use client";

import React, { useState, useEffect, useRef } from "react";

interface AudioSynthesizerProps {
  musicTheme?: string;
}

export default function AudioSynthesizer({ musicTheme = "romantic_piano" }: AudioSynthesizerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pianoChords = [
    [261.63, 329.63, 523.25], // C Major
    [329.63, 392.00, 659.25], // E Minor
    [220.00, 261.63, 440.00], // A Minor
    [174.61, 261.63, 349.23], // F Major
  ];

  const lofiChords = [
    [261.63, 311.13, 392.00, 466.16], // Cm7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [196.00, 246.94, 293.66, 349.23], // G7
  ];

  const stardustChords = [
    [523.25, 659.25, 783.99, 1046.50],
    [587.33, 698.46, 880.00, 1174.66],
    [440.00, 523.25, 659.25, 880.00],
    [349.23, 440.00, 523.25, 698.46],
  ];

  const playNote = (ctx: AudioContext, freq: number, duration: number = 2.4, type: OscillatorType = "sine") => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const startMusic = () => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    const ctx = audioCtxRef.current;
    setIsPlaying(true);

    let step = 0;
    const progression =
      musicTheme === "stardust"
        ? stardustChords
        : musicTheme === "lofi"
        ? lofiChords
        : pianoChords;

    const oscType: OscillatorType = musicTheme === "stardust" ? "triangle" : "sine";

    intervalRef.current = setInterval(() => {
      if (!ctx || ctx.state !== "running") return;
      const currentChord = progression[step % progression.length];
      step++;

      currentChord.forEach((f, idx) => {
        setTimeout(() => {
          if (ctx.state === "running") playNote(ctx, f, 2.8, oscType);
        }, idx * 240);
      });
    }, 2500);
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
        background: isPlaying ? "rgba(219, 39, 119, 0.5)" : "rgba(22, 17, 34, 0.92)",
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
      <span>{isPlaying ? "Ambiance ON" : "Soundtrack"}</span>
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
