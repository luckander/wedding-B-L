"use client";

import React from "react";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import { FlowerDivider } from "./Decorations";
import styles from "./Gallery.module.css";
import { Heart } from "lucide-react";

export default function Gallery() {
  const storyMilestones = [
    {
      year: "2021",
      title: "Como nos conhecemos",
      description: "Um encontro planejado pelo destino. Em meio a risadas e conversas que pareciam não ter fim, uma conexão única e profunda nasceu instantaneamente.",
    },
    {
      year: "2023",
      title: "O início do 'Para Sempre'",
      description: "Entre viagens, sonhos compartilhados e o dia a dia, decidimos que cada momento era melhor se estivéssemos juntos. O namoro amadureceu e virou lar.",
    },
    {
      year: "2025",
      title: "O Pedido de Casamento",
      description: "Com o coração transbordando de certeza e amor, o pedido veio em um dia ensolarado. O 'Sim' mais fácil e feliz que já dissemos um ao outro.",
    },
  ];

  const galleryImages = [
    {
      src: "/images/couple_watercolor_1.png",
      alt: "Caminhando juntos",
      caption: "Caminhando sob a mesma luz...",
      spanClass: styles.spanTall,
    },
    {
      src: "/images/couple_watercolor_2.png",
      alt: "Piquenique romântico",
      caption: "Partilhando sorrisos simples",
      spanClass: styles.spanWide,
    },
    {
      src: "/images/couple_watercolor_3.png",
      alt: "Olhar apaixonado",
      caption: "Onde o coração faz morada",
      spanClass: styles.spanNormal,
    },
    {
      src: "/images/couple_watercolor_4.png",
      alt: "Ao pôr do sol",
      caption: "De mãos dadas rumo ao futuro",
      spanClass: styles.spanNormal,
    },
  ];

  return (
    <section id="historia" className={styles.gallerySection}>
      <div className={styles.container}>
        
        {/* Nossa História Title */}
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <span className={styles.subtitle}>Nossa Jornada</span>
            <h2 className={styles.title}>Nossa História</h2>
            <div className={styles.heartDivider}>
              <div className={styles.line}></div>
              <Heart size={14} className={styles.heartIcon} />
              <div className={styles.line}></div>
            </div>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <div className={styles.timeline}>
          {storyMilestones.map((milestone, index) => (
            <ScrollReveal key={index} delay={index * 150}>
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

        {/* Flower Divider between story and gallery */}
        <FlowerDivider />

        {/* Galeria de Fotos Title */}
        <ScrollReveal>
          <div className={styles.sectionHeader} style={{ marginTop: "1rem" }}>
            <span className={styles.subtitle}>Instantes Compartilhados</span>
            <h2 className={styles.title}>Nossos Momentos</h2>
            <p className={styles.galleryIntro}>
              Alguns dos registros felizes da nossa caminhada. Em breve, esta galeria estará cheia com as memórias do nosso grande dia!
            </p>
          </div>
        </ScrollReveal>

        {/* Asymmetric Gallery Grid */}
        <div className={styles.galleryGrid}>
          {galleryImages.map((image, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className={`${styles.galleryCard} ${image.spanClass}`}>
                <div className={styles.imageWrapper}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={styles.galleryImg}
                  />
                  <div className={styles.hoverOverlay}>
                    <Heart size={24} fill="var(--white)" />
                  </div>
                </div>
                <p className={`${styles.imageCaption} font-dancing`}>
                  {image.caption}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
