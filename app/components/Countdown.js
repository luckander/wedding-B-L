"use client";

import { useEffect, useState } from "react";
import { weddingConfig } from "../config";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const targetDate = new Date(weddingConfig.event.date).getTime();

    const calculateTime = () => {
      const difference = targetDate - Date.now();

      if (difference <= 0) {
        setTimeLeft((prev) => ({ ...prev, isExpired: true }));
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft.isExpired) {
    return (
      <div
        style={{
          fontSize: "1.5rem",
          fontFamily: "var(--font-cormorant), serif",
          fontStyle: "italic",
          color: "var(--sage)",
          textAlign: "center",
          margin: "1.5rem 0",
          animation: "float 4s ease-in-out infinite",
        }}
      >
        O grande dia chegou!
      </div>
    );
  }

  const items = [
    { label: "Dias", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Minutos", value: timeLeft.minutes },
    { label: "Segundos", value: timeLeft.seconds },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        alignItems: "center",
        margin: "2rem auto",
        maxWidth: "450px",
        flexWrap: "wrap",
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 75,
            height: 75,
            borderRadius: "50%",
            background: "var(--white)",
            border: "var(--border-light)",
            boxShadow: "var(--shadow-card)",
            animation: "float 4s ease-in-out infinite",
            animationDelay: `${index * 0.2}s`,
          }}
        >
          <span
            style={{
              fontSize: "1.6rem",
              fontWeight: 500,
              fontFamily: "var(--font-cormorant), serif",
              color: "var(--text-dark)",
              lineHeight: 1.1,
            }}
          >
            {String(item.value).padStart(2, "0")}
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
