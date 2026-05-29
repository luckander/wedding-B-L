"use client";

import React, { useState } from "react";
import { weddingConfig } from "../config";
import ScrollReveal from "./ScrollReveal";
import styles from "./GiftRegistry.module.css";
import { Heart, Gift, Copy, Check, ExternalLink, X } from "lucide-react";

export default function GiftRegistry() {
  const { gifts, payment } = weddingConfig;
  
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedGift, setSelectedGift] = useState(null); // Active gift in modal
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contributionSuccess, setContributionSuccess] = useState(false);

  // Categories list
  const categories = ["Todos", "Lua de Mel", "Casa Nova"];

  // Filtered gifts list
  const filteredGifts = selectedCategory === "Todos" 
    ? gifts 
    : gifts.filter(g => g.category === selectedCategory);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(payment.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleOpenModal = (gift) => {
    setSelectedGift(gift);
    setDonorName("");
    setDonorMessage("");
    setContributionSuccess(false);
    setCopiedPix(false);
  };

  const handleCloseModal = () => {
    setSelectedGift(null);
  };

  const handleConfirmGift = async (e) => {
    e.preventDefault();
    if (!donorName.trim()) return;

    setIsSubmitting(true);

    try {
      // 1. Post to contributions API
      const giftResponse = await fetch("/api/gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          giftId: selectedGift.id,
          giftTitle: selectedGift.title,
          donorName: donorName,
          message: donorMessage,
          amount: selectedGift.price,
          paymentMethod: "Pix/Mercado Pago",
        }),
      });

      // 2. Also automatically add to guestbook as pending if a message is written
      if (donorMessage.trim()) {
        await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: donorName,
            message: `Presenteou com "${selectedGift.title}": ${donorMessage}`,
          }),
        });
      }

      if (giftResponse.ok) {
        setContributionSuccess(true);
      }
    } catch (err) {
      console.error("Error processing contribution:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="presentes" className={styles.registrySection}>
      <div className={styles.container}>
        
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <span className={styles.subtitle}>Lista de Casamento</span>
            <h2 className={styles.title}>Lista de Presentes</h2>
            <div className={styles.divider}></div>
            <p className={styles.headerText}>
              Criamos uma lista de presentes virtuais para que você possa nos ajudar a construir nosso novo lar ou tornar nossa lua de mel inesquecível. Escolha a cota que desejar!
            </p>
          </div>
        </ScrollReveal>

        {/* Categories Tabs */}
        <ScrollReveal>
          <div className={styles.categoryTabs}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.tabBtn} ${selectedCategory === category ? styles.activeTab : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Gifts Grid */}
        <div className={styles.giftsGrid}>
          {filteredGifts.map((gift, idx) => (
            <ScrollReveal key={gift.id} delay={idx * 50}>
              <div className={styles.giftCard}>
                <div className={styles.imageWrapper}>
                  <img src={gift.image} alt={gift.title} className={styles.giftImg} />
                  <span className={styles.categoryTag}>{gift.category}</span>
                </div>
                <div className={styles.giftContent}>
                  <h3 className={styles.giftTitle}>{gift.title}</h3>
                  <p className={styles.giftDesc}>{gift.description}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.giftPrice}>
                      R$ {gift.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleOpenModal(gift)}
                      className={styles.giftBtn}
                    >
                      <Gift size={16} />
                      <span>Presentear</span>
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Modal for Payment and Custom Form */}
        {selectedGift && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modalCard}>
              <button onClick={handleCloseModal} className={styles.closeBtn} aria-label="Fechar modal">
                <X size={20} />
              </button>

              {!contributionSuccess ? (
                <>
                  <div className={styles.modalHeader}>
                    <Gift size={28} className={styles.modalIcon} />
                    <h3 className={styles.modalTitle}>Presentear os Noivos</h3>
                    <p className={styles.modalSubtitle}>
                      Você selecionou: <strong>{selectedGift.title}</strong> (R${" "}
                      {selectedGift.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                    </p>
                  </div>

                  <form onSubmit={handleConfirmGift} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="donor-name" className={styles.inputLabel}>
                        Seu Nome Completo *
                      </label>
                      <input
                        id="donor-name"
                        type="text"
                        required
                        placeholder="Como você quer aparecer no agradecimento..."
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className={styles.textInput}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="donor-msg" className={styles.inputLabel}>
                        Sua Mensagem de Carinho (Opcional)
                      </label>
                      <textarea
                        id="donor-msg"
                        rows={3}
                        placeholder="Escreva uma mensagem especial para nós..."
                        value={donorMessage}
                        onChange={(e) => setDonorMessage(e.target.value)}
                        className={styles.textareaInput}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.paymentSection}>
                      <h4 className={styles.paymentTitle}>Formas de Pagamento</h4>
                      
                      <div className={styles.paymentTabs}>
                        <div className={styles.pixBlock}>
                          <p className={styles.paymentDesc}>
                            1. Copie a chave Pix abaixo e efetue o pagamento do valor da cota no aplicativo do seu banco:
                          </p>
                          <div className={styles.pixKeyBox}>
                            <span className={styles.pixKeyText}>{payment.pixKey}</span>
                            <button
                              type="button"
                              onClick={handleCopyPix}
                              className={styles.copyBtn}
                              title="Copiar Pix"
                            >
                              {copiedPix ? <Check size={16} color="var(--sage)" /> : <Copy size={16} />}
                              <span>{copiedPix ? "Copiado!" : "Copiar"}</span>
                            </button>
                          </div>
                          <div className={styles.pixDetails}>
                            <span>Favorecido: <strong>{payment.pixHolder}</strong></span>
                            <span>Banco: <strong>{payment.bank}</strong></span>
                          </div>
                        </div>

                        <div className={styles.mpDivider}>
                          <span>ou pague por Link de Cartão</span>
                        </div>

                        <div className={styles.mpBlock}>
                          <a 
                            href={payment.mercadoPagoLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.mpBtn}
                            onClick={() => {
                              // If user clicks, fill in donorName if empty to allow validation
                              if (!donorName) {
                                alert("Por favor, digite seu nome acima antes de abrir o link do Mercado Pago para podermos identificar seu presente!");
                              }
                            }}
                          >
                            <span>Ir para Mercado Pago</span>
                            <ExternalLink size={16} />
                          </a>
                          <span className={styles.mpNote}>
                            Aceita cartões de crédito, Pix e boleto.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className={styles.cancelBtn}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={styles.confirmBtn}
                        disabled={isSubmitting || !donorName.trim()}
                      >
                        {isSubmitting ? "Processando..." : "Confirmar Presente"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                // Success Modal Screen
                <div className={styles.modalSuccess}>
                  <div className={styles.successCircle}>
                    <Heart size={36} fill="var(--white)" className={styles.heartLogo} />
                  </div>
                  <h3 className={styles.successTitle}>Muito Obrigado!</h3>
                  <p className={styles.successText}>
                    A sua intenção de presente para <strong>"{selectedGift.title}"</strong> foi registrada com sucesso!
                  </p>
                  <p className={styles.successSubtext}>
                    Obrigado por celebrar esse momento especial conosco. O carinho de vocês deixa nossa casinha e nossa vida mais felizes! 🤍
                  </p>
                  <button onClick={handleCloseModal} className={styles.closeSuccessBtn}>
                    Fechar Janela
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
