"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Music, VolumeX } from "lucide-react";
import styles from "./EnvelopeIntro.module.css";

export default function EnvelopeIntro() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const introReadyRef = useRef(false);

  const markIntroReady = () => {
    if (introReadyRef.current) return;
    introReadyRef.current = true;
    document.body.classList.add("intro-ready");
  };

  useEffect(() => {
    const audio = new Audio("/music.mp3");
    audio.volume = 0.50;
    audio.loop = true;

    const handleTimeUpdate = () => {
      const cur = audio.currentTime;
      if ((cur >= 72 && cur <= 83) || (cur >= 136 && cur <= 147)) {
        audio.volume = 0.25;
      } else {
        audio.volume = 0.50;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current = audio;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.remove("intro-ready");

    const readyFallback = window.setTimeout(markIntroReady, 900);

    return () => {
      window.clearTimeout(readyFallback);
      document.body.classList.remove("intro-ready");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleOpenEnvelope = () => {
    if (!isOpen && !isFadingOut) {
      setIsFadingOut(true);

      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log("Audio play blocked by browser:", err));
      }

      setTimeout(() => {
        setIsOpen(true);
        setIsFadingOut(false);
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }, 600);
    }
  };

  const toggleAudio = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Audio playback error:", err));
    }
  };

  return (
    <>
      {/* OVERLAY TELA CHEIA FIXO PARA O CONVITE FECHADO */}
      {!isOpen && (
        <div
          className={`${styles.closedOverlay} ${isFadingOut ? styles.fadeOut : ""}`}
          onClick={handleOpenEnvelope}
        >
          <div className={styles.overlayBg} />

          <div className={styles.introTextContainer}>
            <h1 className={styles.title}>Você recebeu um convite</h1>
          </div>

          <div className={styles.envelopeClosedWrapper}>
            <Image
              src="/images/envelope-fechado.png"
              alt="Envelope fechado do casamento"
              width={520}
              height={360}
              priority
              style={{ width: "min(520px, 85vw)", height: "auto" }}
              className={styles.envelopeClosedImg}
              onLoad={markIntroReady}
            />
          </div>

          <div className={styles.subtitleContainer}>
            <p className={styles.subtitle}>Toque para abrir</p>
          </div>
        </div>
      )}

      {/* ÍCONE MUSICAL FIXO */}
      {(isOpen || isPlaying) && (
        <button
          onClick={toggleAudio}
          className={`${styles.musicBtn} ${isPlaying ? styles.playing : styles.muted}`}
          aria-label={isPlaying ? "Silenciar música" : "Tocar música"}
          title={isPlaying ? "Silenciar música" : "Tocar música"}
        >
          {isPlaying ? (
            <div className={styles.musicIconWrapper}>
              <Music size={18} />
              <span className={styles.musicPulseRing} />
            </div>
          ) : (
            <VolumeX size={18} />
          )}
        </button>
      )}

      {/*
        SEÇÃO DO ENVELOPE ABERTO
        
        Enquanto !isOpen:
          - position: fixed, inset: 0, z-index: 99998
          - Fica coberta pelo closedOverlay (z-index: 999999)
          - Durante o fade-out do closedOverlay, esta seção já está visível
            mas cobrindo TUDO — o Hero nunca aparece por baixo.
        
        Quando isOpen=true:
          - Remove o posicionamento fixo e volta ao fluxo normal da página.
      */}
      <section className={`${styles.envelopeSection} ${!isOpen ? styles.envelopeSectionCovering : ""}`}>
        <div className={styles.overlay} />

        <div className={styles.envelopeOpenedStage}>
          <div className={styles.envelopeLayersWrapper}>
            <Image
              src="/images/envelope-aberto.png"
              alt="Envelope aberto"
              width={560}
              height={400}
              priority
              style={{ width: "100%", height: "auto" }}
              className={styles.envelopeAberto}
            />

            <Image
              src="/images/invitation-portrait.png"
              alt="Convite oficial Bheatriz e Lucas"
              width={500}
              height={700}
              priority
              className={`${styles.invitationCardMiddle} ${isOpen ? styles.animateSlide : ""}`}
            />

            <Image
              src="/images/envelope-frente.png"
              alt="Bolsa frontal do envelope"
              width={560}
              height={260}
              priority
              style={{ width: "100%", height: "auto" }}
              className={styles.envelopeFrente}
            />
          </div>
        </div>
      </section>
    </>
  );
}
