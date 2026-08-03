"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import styles from "./Gallery.module.css";

export default function Gallery() {
  const storyMilestones = [
    {
      year: "2022",
      title: "O encontro",
      image: "/images/story-1.png",
      description:
        "Só podia ser jogando vôlei. Não que um deles tenha ido muito com a cara do outro... 'esse menino sorri demais'",
    },
    {
      year: "2024",
      title: "O primeiro passo",
      image: "/images/story-2.png",
      description:
        "Numa noite estrelada disseram o primeiro sim.",
    },
    {
      year: "2025",
      title: "O nosso segundo sim",
      image: "/images/story-3.png",
      description:
        "Do alto de uma serra, o lugar mais importante para ela, com o sol nascendo ao fundo, ela aceitou o seu pedido.",
    },
    {
      year: "2026",
      title: "O Sim",
      image: "/images/story-4.png",
      description:
        "No dia 13 de setembro, Bheatriz e Lucas celebram o início da vida a dois no Haras Pôr do Sol.",
    },
  ];

  const galleryImages = [
    { src: "/images/gallery-1.png", alt: "Bheatriz e Lucas - foto 1" },
    { src: "/images/gallery-2.png", alt: "Bheatriz e Lucas - foto 2" },
    { src: "/images/gallery-3.png", alt: "Bheatriz e Lucas - foto 3" },
    { src: "/images/gallery-4.png", alt: "Bheatriz e Lucas - foto 4" },
  ];

  return (
    <section id="historia" className={styles.gallerySection}>
      <div className={styles.container}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <h2 className={styles.title}>Nossa história</h2>
            <div className={styles.divider} />
          </div>
        </ScrollReveal>

        <div className={styles.timelineWrapper}>
          <div className={styles.timeline}>
            {storyMilestones.map((milestone, index) => {
              const isTop = index % 2 === 0;
              return (
                <div
                  key={milestone.title}
                  style={{ gridColumn: index + 1, gridRow: isTop ? 1 : 2 }}
                  className={styles.timelineColumnCell}
                >
                  <ScrollReveal delay={index * 150}>
                    <div className={`${styles.timelineItem} ${isTop ? styles.topItem : styles.bottomItem}`}>
                      <div className={styles.timelineContent}>
                        <Image
                          src={milestone.image}
                          alt={`${milestone.year} - ${milestone.title}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className={styles.timelineImage}
                        />
                        <div className={styles.timelineText}>
                          <span className={styles.timelineYear}>{milestone.year}</span>
                          <h3 className={styles.timelineTitle}>{milestone.title}</h3>
                          <p className={styles.timelineDescription}>{milestone.description}</p>
                        </div>
                      </div>
                      <div className={styles.timelineDot}>
                        <Image
                          src="/images/pin2.png"
                          alt=""
                          width={22}
                          height={22}
                          className={styles.timelinePin}
                        />
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        </div>

        <ScrollReveal>
          <div className={styles.sectionHeader} style={{ marginTop: "4rem" }}>
            <h2 className={styles.title}>Galeria</h2>
            <div className={styles.divider} />
          </div>
        </ScrollReveal>

        <div className={styles.galleryGrid}>
          {galleryImages.map((image, index) => (
            <ScrollReveal key={image.src} delay={index * 100}>
              <div className={styles.galleryCard}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.galleryImg}
                  />
                  <div className={styles.hoverOverlay}>
                    <Heart size={24} fill="var(--white)" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
