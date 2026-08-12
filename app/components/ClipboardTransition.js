"use client";

import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import styles from "./ClipboardTransition.module.css";

export default function ClipboardTransition() {
  return (
    <section className={styles.transitionSection}>
      <div className={styles.overlay} />
      <ScrollReveal className={styles.clipboardReveal}>
        <div className={styles.clipboardContainer}>
          <Image
            src="/images/clipboard(v2).webp"
            alt="Elemento decorativo"
            width={800}
            height={745}
            priority
            className={styles.clipboardImg}
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
