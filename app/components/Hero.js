"use client";

import React from "react";
import Image from "next/image";
import { weddingConfig } from "../config";
import { CornerLeaves } from "./Decorations";
import Countdown from "./Countdown";
import styles from "./Hero.module.css";
import { MapPin, Calendar, Clock } from "lucide-react";

export default function Hero() {
  const { names, event } = weddingConfig;
  
  // Format wedding date to readable Brazilian format
  const weddingDate = new Date(event.date);
  const formattedDay = weddingDate.toLocaleDateString("pt-BR", { day: "2-digit" });
  const formattedMonth = weddingDate.toLocaleDateString("pt-BR", { month: "long" }).replace(/^\w/, (c) => c.toUpperCase());
  const formattedYear = weddingDate.getFullYear();
  const formattedWeekday = weddingDate.toLocaleDateString("pt-BR", { weekday: "long" }).replace(/^\w/, (c) => c.toUpperCase());
  const formattedTime = weddingDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <section className={styles.heroSection}>
      {/* Background watercolor wash */}
      <div className={styles.backgroundOverlay}></div>

      {/* Main invitation stationery container */}
      <div className={`${styles.invitationCard} animate-fade-in`}>
        {/* Soft botanical corner borders */}
        <CornerLeaves position="top-left" size={90} opacity={0.25} />
        <CornerLeaves position="top-right" size={90} opacity={0.25} />
        <CornerLeaves position="bottom-left" size={90} opacity={0.25} />
        <CornerLeaves position="bottom-right" size={90} opacity={0.25} />

        {/* Biblical Quote / Invitation Subtitle */}
        <div className={`${styles.verseContainer} animate-fade-in delay-1`}>
          <p className="font-great-vibes" style={{ fontSize: "1.6rem", color: "var(--sage)", marginBottom: "4px" }}>
            Nossa união abençoada
          </p>
          <p className={styles.verseText}>"{event.verse}"</p>
        </div>

        {/* Couple Names */}
        <div className={`${styles.namesContainer} animate-fade-in delay-2`}>
          <h1 className="font-great-vibes">{names.bride}</h1>
          <span className={styles.ampersand}>&</span>
          <h1 className="font-great-vibes">{names.groom}</h1>
        </div>

        <p className={`${styles.invitationCall} animate-fade-in delay-3`}>
          Convidam você para celebrar o seu amor e união perante Deus e as testemunhas.
        </p>

        {/* Details Wrapper */}
        <div className={`${styles.detailsGrid} animate-fade-in delay-3`}>
          <div className={styles.detailItem}>
            <Calendar size={18} className={styles.detailIcon} />
            <span className={styles.detailText}>
              <strong>{formattedWeekday}</strong>, {formattedDay} de {formattedMonth} de {formattedYear}
            </span>
          </div>

          <div className={styles.detailItem}>
            <Clock size={18} className={styles.detailIcon} />
            <span className={styles.detailText}>
              Às <strong>{formattedTime}h</strong>
            </span>
          </div>

          <div className={styles.detailItem}>
            <MapPin size={18} className={styles.detailIcon} />
            <span className={styles.detailText}>
              <strong>{event.venueName}</strong> — {event.venueAddress}
            </span>
          </div>
        </div>

        {/* Real-time Countdown component */}
        <div className="animate-fade-in delay-4">
          <Countdown />
        </div>

        {/* Call to Actions for rapid navigation */}
        <div className={`${styles.actions} animate-fade-in delay-4`}>
          <a href="#rsvp" className={styles.primaryBtn}>
            Confirmar Presença
          </a>
          <a href="#presentes" className={styles.secondaryBtn}>
            Lista de Presentes
          </a>
        </div>
      </div>
    </section>
  );
}
