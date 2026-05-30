"use client";

import { Calendar, Clock, ExternalLink, Gift, MapPin, Shirt, Send } from "lucide-react";
import { weddingConfig } from "../config";
import { CornerLeaves } from "./Decorations";
import Countdown from "./Countdown";
import styles from "./Hero.module.css";

export default function Hero() {
  const { names, event } = weddingConfig;
  const weddingDate = new Date(event.date);
  const formattedDate = weddingDate.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = weddingDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className={styles.heroSection}>
      <div className={styles.backgroundOverlay} />

      <div className={`${styles.invitationCard} animate-fade-in`}>
        <CornerLeaves position="top-left" size={96} opacity={0.22} />
        <CornerLeaves position="top-right" size={96} opacity={0.22} />
        <CornerLeaves position="bottom-left" size={96} opacity={0.22} />
        <CornerLeaves position="bottom-right" size={96} opacity={0.22} />

        <img src="/logo casal.png" alt="Monograma de Bheatriz e Lucas" className={styles.monogram} />

        <div className={`${styles.verseContainer} animate-fade-in delay-1`}>
          <p className="font-great-vibes" style={{ fontSize: "1.55rem", color: "var(--sage)", marginBottom: 4 }}>
            Nosso convite
          </p>
          <p className={styles.verseText}>{event.verse}</p>
        </div>

        <div className={`${styles.namesContainer} animate-fade-in delay-2`}>
          <h1 className="font-great-vibes">{names.bride}</h1>
          <span className={styles.ampersand}>&</span>
          <h1 className="font-great-vibes">{names.groom}</h1>
        </div>

        <p className={`${styles.invitationCall} animate-fade-in delay-3`}>
          Com alegria, convidam voce para celebrar o amor, a fe e o comeco da vida a dois.
        </p>

        <div className={`${styles.detailsGrid} animate-fade-in delay-3`}>
          <div className={styles.detailItem}>
            <Calendar size={18} className={styles.detailIcon} />
            <span className={styles.detailText}>
              <strong>{formattedDate}</strong>
            </span>
          </div>
          <div className={styles.detailItem}>
            <Clock size={18} className={styles.detailIcon} />
            <span className={styles.detailText}>
              Chegada as <strong>{event.arrivalTime}h</strong> | Cerimonia as <strong>{formattedTime}h</strong>
            </span>
          </div>
          <div className={styles.detailItem}>
            <MapPin size={18} className={styles.detailIcon} />
            <span className={styles.detailText}>
              <strong>{event.venueName}</strong> - {event.venueAddress}
            </span>
          </div>
          <div className={styles.venueLinks}>
            <a href={event.mapsLink} target="_blank" rel="noopener noreferrer">
              Google Maps
              <ExternalLink size={13} />
            </a>
            <a href={event.wazeLink} target="_blank" rel="noopener noreferrer">
              Waze
              <ExternalLink size={13} />
            </a>
          </div>
          <div className={styles.detailItem}>
            <Shirt size={18} className={styles.detailIcon} />
            <span className={styles.detailText}>
              Traje: <strong>{event.dressCode.type}</strong>
            </span>
          </div>
        </div>

        <div className="animate-fade-in delay-4">
          <Countdown />
        </div>

        <div className={`${styles.actions} animate-fade-in delay-4`}>
          <a href="#rsvp" className={styles.primaryBtn}>
            <Send size={16} />
            Confirmar presenca
          </a>
          <a href="#presentes" className={styles.secondaryBtn}>
            <Gift size={16} />
            Lista de presentes
          </a>
        </div>
      </div>
    </section>
  );
}
