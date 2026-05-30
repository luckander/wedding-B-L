"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Gift, Heart, X } from "lucide-react";
import { weddingConfig } from "../config";
import ScrollReveal from "./ScrollReveal";
import styles from "./GiftRegistry.module.css";

export default function GiftRegistry() {
  const { gifts, payment } = weddingConfig;
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedGift, setSelectedGift] = useState(null);
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [contributionSuccess, setContributionSuccess] = useState(false);

  const categories = ["Todos", ...new Set(gifts.map((gift) => gift.category))];
  const filteredGifts =
    selectedCategory === "Todos" ? gifts : gifts.filter((gift) => gift.category === selectedCategory);

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(payment.pixKey);
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

  const handleConfirmGift = async (event) => {
    event.preventDefault();
    if (!donorName.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: selectedGift.id,
          giftTitle: selectedGift.title,
          donorName,
          message: donorMessage,
          amount: selectedGift.price,
          paymentMethod: "Pix ou Mercado Pago",
        }),
      });

      if (donorMessage.trim()) {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: donorName,
            message: `Presenteou com "${selectedGift.title}": ${donorMessage}`,
          }),
        });
      }

      if (response.ok) setContributionSuccess(true);
    } catch (error) {
      console.error("Error processing contribution:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMercadoPagoCheckout = async () => {
    if (!donorName.trim()) return;

    setIsCreatingCheckout(true);

    try {
      const response = await fetch("/api/payments/mercado-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedGift.title,
          amount: selectedGift.price,
          donorName,
        }),
      });

      const data = await response.json();
      if (data.checkoutUrl) window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening Mercado Pago checkout:", error);
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  return (
    <section id="presentes" className={styles.registrySection}>
      <div className={styles.container}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <span className={styles.subtitle}>Lista de casamento</span>
            <h2 className={styles.title}>Presentes simbolicos</h2>
            <div className={styles.divider} />
            <p className={styles.headerText}>
              Escolha uma cota, registre seu nome e finalize pelo Pix ou pelo link do Mercado Pago. A lista esta pronta para voce trocar, remover ou adicionar presentes depois.
            </p>
          </div>
        </ScrollReveal>

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

        <div className={styles.giftsGrid}>
          {filteredGifts.map((gift, index) => (
            <ScrollReveal key={gift.id} delay={index * 50}>
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
                    <button onClick={() => handleOpenModal(gift)} className={styles.giftBtn}>
                      <Gift size={16} />
                      <span>Presentear</span>
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {selectedGift && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modalCard}>
              <button onClick={() => setSelectedGift(null)} className={styles.closeBtn} aria-label="Fechar">
                <X size={20} />
              </button>

              {!contributionSuccess ? (
                <>
                  <div className={styles.modalHeader}>
                    <Gift size={28} className={styles.modalIcon} />
                    <h3 className={styles.modalTitle}>Presentear Bheatriz e Lucas</h3>
                    <p className={styles.modalSubtitle}>
                      Voce selecionou <strong>{selectedGift.title}</strong> por R${" "}
                      {selectedGift.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <form onSubmit={handleConfirmGift} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="donor-name" className={styles.inputLabel}>
                        Seu nome completo
                      </label>
                      <input
                        id="donor-name"
                        type="text"
                        required
                        placeholder="Como os noivos vao identificar o presente"
                        value={donorName}
                        onChange={(event) => setDonorName(event.target.value)}
                        className={styles.textInput}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="donor-msg" className={styles.inputLabel}>
                        Mensagem opcional
                      </label>
                      <textarea
                        id="donor-msg"
                        rows={3}
                        placeholder="Escreva um recado carinhoso"
                        value={donorMessage}
                        onChange={(event) => setDonorMessage(event.target.value)}
                        className={styles.textareaInput}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.paymentSection}>
                      <h4 className={styles.paymentTitle}>Pagamento</h4>

                      <div className={styles.pixBlock}>
                        <p className={styles.paymentDesc}>
                          Copie a chave Pix e pague o valor da cota no aplicativo do seu banco.
                        </p>
                        <div className={styles.pixKeyBox}>
                          <span className={styles.pixKeyText}>{payment.pixKey}</span>
                          <button type="button" onClick={handleCopyPix} className={styles.copyBtn}>
                            {copiedPix ? <Check size={16} color="var(--sage)" /> : <Copy size={16} />}
                            <span>{copiedPix ? "Copiado" : "Copiar"}</span>
                          </button>
                        </div>
                        <div className={styles.pixDetails}>
                          <span>
                            Favorecido: <strong>{payment.pixHolder}</strong>
                          </span>
                          <span>
                            Banco: <strong>{payment.bank}</strong>
                          </span>
                        </div>
                      </div>

                      <div className={styles.mpDivider}>
                        <span>ou</span>
                      </div>

                      <div className={styles.mpBlock}>
                        <button
                          type="button"
                          className={styles.mpBtn}
                          onClick={handleMercadoPagoCheckout}
                          disabled={!donorName.trim() || isCreatingCheckout}
                        >
                          <span>{isCreatingCheckout ? "Criando checkout..." : "Pagar pelo Mercado Pago"}</span>
                          <ExternalLink size={16} />
                        </button>
                        <span className={styles.mpNote}>Depois do pagamento, clique em confirmar presente.</span>
                      </div>
                    </div>

                    <div className={styles.modalActions}>
                      <button type="button" onClick={() => setSelectedGift(null)} className={styles.cancelBtn} disabled={isSubmitting}>
                        Cancelar
                      </button>
                      <button type="submit" className={styles.confirmBtn} disabled={isSubmitting || !donorName.trim()}>
                        {isSubmitting ? "Registrando..." : "Confirmar presente"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className={styles.modalSuccess}>
                  <div className={styles.successCircle}>
                    <Heart size={36} fill="var(--white)" className={styles.heartLogo} />
                  </div>
                  <h3 className={styles.successTitle}>Muito obrigado</h3>
                  <p className={styles.successText}>
                    Seu presente <strong>{selectedGift.title}</strong> foi registrado.
                  </p>
                  <p className={styles.successSubtext}>
                    Obrigado por fazer parte da nossa historia com tanto carinho.
                  </p>
                  <button onClick={() => setSelectedGift(null)} className={styles.closeSuccessBtn}>
                    Fechar
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
