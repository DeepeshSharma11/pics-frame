"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  isHeart: boolean;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    const isMobile = window.innerWidth < 768;
    // On mobile, keep fixed resolution to eliminate GPU overhead
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

    // Mobile: 8 particles, Desktop: 16 particles (ultra-lightweight)
    const count = isMobile ? 8 : 16;
    const particles: Particle[] = [];
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * cssWidth,
        y: Math.random() * cssHeight,
        size: isMobile ? Math.random() * 4 + 2 : Math.random() * 5 + 3,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: -(Math.random() * 0.35 + 0.1),
        opacity: Math.random() * 0.45 + 0.15,
        isHeart: i % 2 === 0,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;

      const delta = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      ctx.clearRect(0, 0, cssWidth, cssHeight);

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.speedX * delta;
        p.y += p.speedY * delta;

        if (p.y < -15) {
          p.y = cssHeight + 10;
          p.x = Math.random() * cssWidth;
        }
        if (p.x < -15) p.x = cssWidth + 10;
        if (p.x > cssWidth + 15) p.x = -10;

        ctx.fillStyle = p.isHeart
          ? `rgba(244, 114, 182, ${p.opacity})`
          : `rgba(253, 230, 138, ${p.opacity})`;

        if (p.isHeart) {
          const s = p.size;
          ctx.beginPath();
          ctx.arc(p.x - s / 3, p.y, s / 3, 0, Math.PI * 2);
          ctx.arc(p.x + s / 3, p.y, s / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
