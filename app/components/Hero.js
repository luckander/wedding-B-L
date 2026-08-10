"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Clock, ExternalLink, Gift, MapPin, Shirt, Send, X } from "lucide-react";
import { weddingConfig } from "../config";
import Countdown from "./Countdown";
import styles from "./Hero.module.css";

export default function Hero() {
  const { names, event } = weddingConfig;
  const [isDressCodeOpen, setIsDressCodeOpen] = useState(false);
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
      <div className={styles.videoBackgroundWrapper}>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/images/background-hero.webp"
          className={styles.backgroundVideo}
        >
          <source src="/images/background-video.webm" type="video/mp4" />
        </video>
        <div className={styles.backgroundOverlay} />
      </div>

      <div className={`${styles.invitationCard} animate-fade-in`}>
        <Image
          src="/logo casal.png"
          alt="Monograma de Bheatriz e Lucas"
          width={150}
          height={150}
          priority
          style={{ width: "auto", height: "auto" }}
          className={styles.monogram}
        />

        <div className={`${styles.verseContainer} animate-fade-in delay-1`}>
          <p className="font-edwardian" style={{ fontSize: "2.15rem", color: "var(--sage)", marginBottom: 4 }}>
            Queridos amigos,
          </p>
          <p className={styles.verseText}>{event.verse}</p>
        </div>

        <div className={`${styles.namesContainer} animate-fade-in delay-2`}>
          <h1 className="font-edwardian">{names.bride}</h1>
          <span className={styles.ampersand}>&</span>
          <h1 className="font-edwardian">{names.groom}</h1>
        </div>

        <p className={`${styles.invitationCall} animate-fade-in delay-3`}>
          Com alegria, convidam você para celebrar o amor, a fé e o começo da vida a dois.
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
              Chegada às <strong>{event.arrivalTime}h</strong> | Cerimônia às <strong>{formattedTime}h</strong>
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
              Traje:{" "}
              <button
                type="button"
                className={styles.dressCodeBtn}
                onClick={() => setIsDressCodeOpen(true)}
                style={{ marginLeft: "0.4rem", verticalAlign: "middle" }}
              >
                Saber mais
              </button>
            </span>
          </div>
        </div>

        <div className="animate-fade-in delay-4">
          <Countdown />
        </div>

        <div className={`${styles.actions} animate-fade-in delay-4`}>
          <a href="#rsvp" className={styles.primaryBtn}>
            <Send size={16} />
            Confirmar presença
          </a>
          <a href="#presentes" className={styles.secondaryBtn}>
            <Gift size={16} />
            Lista de presentes
          </a>
        </div>
      </div>

      {isDressCodeOpen && (
        <div className={styles.dressCodeBackdrop} onClick={() => setIsDressCodeOpen(false)}>
          <div className={styles.dressCodePopover} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.dressCodeClose}
              onClick={() => setIsDressCodeOpen(false)}
              aria-label="Fechar informacoes de traje"
            >
              <X size={18} />
            </button>
            <div className={styles.dressCodeImage}>
              <Image
                src="/images/dress-code.jpg"
                alt="Referencia visual de traje esporte fino"
                fill
                sizes="(max-width: 640px) 86vw, 320px"
                unoptimized
              />
            </div>
            <div className={styles.dressCodeContent}>
              <h2>Traje esporte fino</h2>
              <p>
                Desejamos que aproveitem a festa de forma elegante e leve, por isso, sugerimos para as mulheres vestidos leves, midi/longos ou macacões elegantes.
              </p>
              <p>
                Já para os homens, sugerimos blazer, camisa social e calça de alfaiataria ou sarja, sem necessidade de terno completo.
              </p>
              <p>
                Também gostaríamos de sugerir sapatos adequados para grama, pois a cerimônia é em local aberto.
              </p>
              <p>
                Por fim, reservamos os tons de branco e off-white exclusivamente para a noiva.
              </p>
              <button type="button" className={styles.dressCodeConfirm} onClick={() => setIsDressCodeOpen(false)}>
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
