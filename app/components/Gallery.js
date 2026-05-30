"use client";

import { Heart } from "lucide-react";
import { FlowerDivider } from "./Decorations";
import ScrollReveal from "./ScrollReveal";
import styles from "./Gallery.module.css";

export default function Gallery() {
  const storyMilestones = [
    {
      year: "2022",
      title: "O encontro",
      description:
        "Só podia ser jogando vôlei. Não que um deles tenha ido muito com a cara do outro. 'esse menino tem dente demais'",
    },
    {
      year: "2024",
      title: "O amor começou a criar raízes",
      description:
        "Numa noite estrelada disseram o primeiro sim",
    },
    {
      year: "2025",
      title: "O nosso segundo sim",
      description:
        "Do alto de uma serra, o lugar mais importante para ela, com o sol nascendo ao fundo, ela aceitou o seu pedido.",
    },
    {
      year: "2026",
      title: "O Sim",
      description:
        "No dia 13 de setembro, Bheatriz e Lucas celebram o inicio da vida a dois no Haras Por do Sol.",
    },
  ];

  const galleryImages = [
    {
      src: "/images/couple_watercolor_1.png",
      alt: "Casal em pintura aquarelada",
      caption: "De maos dadas rumo ao futuro",
      spanClass: styles.spanTall,
    },
    {
      src: "/images/couple_watercolor_2.png",
      alt: "Cena romantica em aquarela",
      caption: "Um amor calmo, bonito e inteiro",
      spanClass: styles.spanWide,
    },
    {
      src: "/images/couple_watercolor_3.png",
      alt: "Casal em paisagem bucólica",
      caption: "Onde o coracao faz morada",
      spanClass: styles.spanNormal,
    },
    {
      src: "/images/couple_watercolor_4.png",
      alt: "Casal ao por do sol",
      caption: "Treze de setembro de 2026",
      spanClass: styles.spanNormal,
    },
  ];

  return (
    <section id="historia" className={styles.gallerySection}>
      <div className={styles.container}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <span className={styles.subtitle}>Nossa jornada</span>
            <h2 className={styles.title}>Nossa historia</h2>
            <div className={styles.heartDivider}>
              <div className={styles.line} />
              <Heart size={14} className={styles.heartIcon} />
              <div className={styles.line} />
            </div>
          </div>
        </ScrollReveal>

        <div className={styles.timeline}>
          {storyMilestones.map((milestone, index) => (
            <ScrollReveal key={milestone.title} delay={index * 150}>
              <div className={`${styles.timelineItem} ${index % 2 === 0 ? styles.left : styles.right}`}>
                <div className={styles.timelineDot}>
                  <Heart size={12} fill="var(--white)" />
                </div>
                <div className={styles.timelineContent}>
                  <span className={styles.timelineYear}>{milestone.year}</span>
                  <h3 className={styles.timelineTitle}>{milestone.title}</h3>
                  <p className={styles.timelineDescription}>{milestone.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <FlowerDivider />

        <ScrollReveal>
          <div className={styles.sectionHeader} style={{ marginTop: "1rem" }}>
            <span className={styles.subtitle}>Instantes compartilhados</span>
            <h2 className={styles.title}>Galeria</h2>
            <p className={styles.galleryIntro}>
              Um espaco editorial para fotos do casal. Por enquanto, deixei imagens aquareladas como base para voce trocar pelas fotos reais depois.
            </p>
          </div>
        </ScrollReveal>

        <div className={styles.galleryGrid}>
          {galleryImages.map((image, index) => (
            <ScrollReveal key={image.src} delay={index * 100}>
              <div className={`${styles.galleryCard} ${image.spanClass}`}>
                <div className={styles.imageWrapper}>
                  <img src={image.src} alt={image.alt} className={styles.galleryImg} />
                  <div className={styles.hoverOverlay}>
                    <Heart size={24} fill="var(--white)" />
                  </div>
                </div>
                <p className={`${styles.imageCaption} font-dancing`}>{image.caption}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
