"use client";

import React, { useEffect, useRef } from "react";
import { ParticleType, ThemeType } from "../types/gallery";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: string;
}

interface ParticleBackgroundProps {
  particleType?: ParticleType;
  theme?: ThemeType;
}

export default function ParticleBackground({
  particleType = "hearts",
  theme = "rose",
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    if (dpr !== 1) ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      if (dpr !== 1) ctx.scale(dpr, dpr);
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const count = isMobile ? 10 : 20;
    const particles: Particle[] = [];
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * cssWidth,
        y: Math.random() * cssHeight,
        size: isMobile ? Math.random() * 5 + 3 : Math.random() * 7 + 4,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -(Math.random() * 0.4 + 0.15),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.5 + 0.2,
        type: particleType,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const curWidth = window.innerWidth;
      const curHeight = window.innerHeight;

      const delta = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      ctx.clearRect(0, 0, curWidth, curHeight);

      // Warm, elegant color paletting (No harsh blues/purples)
      let primaryColor = "251, 113, 133"; // rose coral
      let secondaryColor = "254, 240, 138"; // warm gold

      if (theme === "obsidian") {
        primaryColor = "251, 113, 133"; // rose gold
        secondaryColor = "254, 240, 138"; // champagne glow
      } else if (theme === "sunset") {
        primaryColor = "251, 146, 60"; // amber sunset
        secondaryColor = "254, 215, 170"; // warm peach
      } else if (theme === "emerald") {
        primaryColor = "52, 211, 153"; // emerald
        secondaryColor = "253, 230, 138"; // champagne gold
      } else if (theme === "ruby") {
        primaryColor = "244, 63, 94"; // ruby red
        secondaryColor = "254, 205, 211"; // soft blush
      }

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.speedX * delta;
        p.y += p.speedY * delta;
        p.rotation += p.rotationSpeed * delta;

        if (p.y < -20) {
          p.y = curHeight + 15;
          p.x = Math.random() * curWidth;
        }
        if (p.x < -20) p.x = curWidth + 15;
        if (p.x > curWidth + 20) p.x = -15;

        const color = i % 2 === 0 ? primaryColor : secondaryColor;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;

        const s = p.size;

        if (particleType === "hearts") {
          // Smooth heart shape
          ctx.beginPath();
          ctx.arc(-s / 3, 0, s / 3, 0, Math.PI * 2);
          ctx.arc(s / 3, 0, s / 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleType === "petals") {
          // Rose petal ellipse
          ctx.beginPath();
          ctx.ellipse(0, 0, s, s / 2, p.rotation, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleType === "stars") {
          // 4-point star sparkle
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s / 3, -s / 3);
          ctx.lineTo(s, 0);
          ctx.lineTo(s / 3, s / 3);
          ctx.lineTo(0, s);
          ctx.lineTo(-s / 3, s / 3);
          ctx.lineTo(-s, 0);
          ctx.lineTo(-s / 3, -s / 3);
          ctx.closePath();
          ctx.fill();
        } else if (particleType === "butterflies") {
          // Butterfly wings
          ctx.beginPath();
          ctx.ellipse(-s / 2, -s / 3, s / 2, s / 3, 0.4, 0, Math.PI * 2);
          ctx.ellipse(s / 2, -s / 3, s / 2, s / 3, -0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Twinkle circle sparkle
          ctx.beginPath();
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleType, theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        transform: "translate3d(0, 0, 0)",
      }}
    />
  );
}
