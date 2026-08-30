"use client";

import React, { useState, useEffect } from "react";

interface DaysCounterProps {
  startDateStr: string;
  recipientName: string;
}

export default function DaysCounter({ startDateStr, recipientName }: DaysCounterProps) {
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeElapsed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [startDateStr]);

  return (
    <div className="counter-container">
      <div className="counter-badge">
        <span className="sparkle">✨</span> Cherishing Every Second with {recipientName} <span className="sparkle">✨</span>
      </div>
      <div className="counter-grid">
        <div className="counter-card">
          <span className="counter-num">{timeElapsed.days}</span>
          <span className="counter-label">Days</span>
        </div>
        <div className="counter-sep">:</div>
        <div className="counter-card">
          <span className="counter-num">{String(timeElapsed.hours).padStart(2, "0")}</span>
          <span className="counter-label">Hours</span>
        </div>
        <div className="counter-sep">:</div>
        <div className="counter-card">
          <span className="counter-num">{String(timeElapsed.minutes).padStart(2, "0")}</span>
          <span className="counter-label">Minutes</span>
        </div>
        <div className="counter-sep">:</div>
        <div className="counter-card">
          <span className="counter-num highlight">{String(timeElapsed.seconds).padStart(2, "0")}</span>
          <span className="counter-label">Seconds</span>
        </div>
      </div>
    </div>
  );
}
