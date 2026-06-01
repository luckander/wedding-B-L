"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Gift, Heart, Minus, Plus, X } from "lucide-react";
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

  // NOVO ESTADO: Quantidade de cotas selecionadas pelo convidado
  const [giftQuantity, setGiftQuantity] = useState(1);

  const [visibleCount, setVisibleCount] = useState(8);

  const categories = ["Todos", ...new Set(gifts.map((gift) => gift.category))];
  
  const filteredGifts =
    selectedCategory === "Todos" ? gifts : gifts.filter((gift) => gift.category === selectedCategory);

  const displayedGifts = filteredGifts.slice(0, visibleCount);

  // Identifica se o item atual funciona como Cota (ex: se o nome contiver "Cota")
  const isCotaItem = selectedGift?.title.toLowerCase().includes("cota");
  
  // Calcula o preço final dinamicamente com base na quantidade
  const finalPrice = selectedGift ? selectedGift.price * giftQuantity : 0;

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setVisibleCount(8);
  };

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 8);
  };

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(payment.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleOpenModal = (gift) => {
    setSelectedGift(gift);
    setGiftQuantity(1); // Reseta a quantidade para 1 sempre que abrir um novo presente
    setDonorName("");
    setDonorMessage("");
    setContributionSuccess(false);
    setCopiedPix(false);
  };

  // Funções para o controle do seletor de cotas
  const incrementQuantity = () => setGiftQuantity((prev) => prev + 1);
  const decrementQuantity = () => setGiftQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setGiftQuantity(value);
    } else if (e.target.value === "") {
      setGiftQuantity(""); // permite que o usuário apague para digitar
    }
  };

  const handleConfirmGift = async (event) => {
    event.preventDefault();
    if (!donorName.trim() || !giftQuantity) return;

    setIsSubmitting(true);

    // Ajusta o texto do título para salvar com a quantidade de cotas
    const titleWithQuantity = isCotaItem 
      ? `${selectedGift.title} (${giftQuantity}x cotas)`
      : selectedGift.title;

    try {
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: selectedGift.id,
          giftTitle: titleWithQuantity,
          donorName,
          message: donorMessage,
          amount: finalPrice, // ENVIA O VALOR MULTIPLICADO
          paymentMethod: "Pix ou Mercado Pago",
        }),
      });

      if (donorMessage.trim()) {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: donorName,
            message: `Presenteou com "${titleWithQuantity}": ${donorMessage}`,
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
    if (!donorName.trim() || !giftQuantity) return;

    setIsCreatingCheckout(true);

    const titleWithQuantity = isCotaItem 
      ? `${selectedGift.title} (${giftQuantity}x cotas)`
      : selectedGift.title;

    try {
      const response = await fetch("/api/payments/mercado-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleWithQuantity,
          amount: finalPrice, // MERCADO PAGO RECEBE O VALOR MULTIPLICADO
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
            <h2 className={styles.title}>Presentes simbólicos</h2>
            <div className={styles.divider} />
            <p className={styles.headerText}>
              Escolha um item da nossa casa para nos presentear. Você poderá finalizar o gesto através de Pix ou pelo Mercado Pago.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.categoryTabs}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.tabBtn} ${selectedCategory === category ? styles.activeTab : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className={styles.giftsGrid}>
          {displayedGifts.map((gift, index) => (
            <ScrollReveal key={gift.id} delay={index * 30}>
              <div className={styles.giftCard}>
                <div className={styles.imageWrapper}>
                  <img src={gift.image} alt={gift.title} className={styles.giftImg} />
                  <span className={styles.categoryTag}>{gift.category}</span>
                </div>
                <div className={styles.giftContent}>
                  <h3 className={styles.giftTitle}>{gift.title}</h3>
                  <div className={styles.cardFooter}>
                    <span className={styles.giftPrice}>
                      {gift.title.toLowerCase().includes("cota") ? "Cota: " : ""}
                      R$ {gift.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => handleOpenModal(gift)} className={styles.giftBtn}>
                      <Gift size={15} />
                      <span>Presentear</span>
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {filteredGifts.length > visibleCount && (
          <ScrollReveal>
            <div className={styles.loadMoreContainer}>
              <button onClick={handleLoadMore} className={styles.loadMoreBtn}>
                Ver mais presentes
              </button>
            </div>
          </ScrollReveal>
        )}

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
                    
                    {/* SUBTÍTULO MODIFICADO PARA MOSTRAR O TOTAL DINÂMICO */}
                    <p className={styles.modalSubtitle}>
                      Você selecionou <strong>{selectedGift.title}</strong> por{" "}
                      <strong>
                        R$ {finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </strong>
                    </p>
                  </div>

                  {/* ALERTA E SELETOR DE COTAS CONDICIONAL */}
                  {isCotaItem && (
                    <div className={styles.cotaWrapper}>
                      <p className={styles.cotaAlert}>
                        ✨ Este item é uma cota. Você pode presentear com quantas cotas desejar!
                      </p>
                      <div className={styles.cotaSelector}>
                        <button type="button" onClick={decrementQuantity} className={styles.qtyBtn}>
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          value={giftQuantity}
                          onChange={handleQuantityChange}
                          onBlur={() => { if (!giftQuantity) setGiftQuantity(1); }}
                          className={styles.qtyInput}
                          min="1"
                        />
                        <button type="button" onClick={incrementQuantity} className={styles.qtyBtn}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleConfirmGift} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="donor-name" className={styles.inputLabel}>
                        Seu nome completo
                      </label>
                      <input
                        id="donor-name"
                        type="text"
                        required
                        placeholder="Como os noivos vão identificar o presente"
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
                          Copie a chave Pix e pague o valor total de <strong>R$ {finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong> no app do seu banco.
                        </p>
                        <div className={styles.pixKeyBox}>
                          <span className={styles.pixKeyText}>{payment.pixKey}</span>
                          <button type="button" onClick={handleCopyPix} className={styles.copyBtn}>
                            {copiedPix ? <Check size={16} color="var(--sage)" /> : <Copy size={16} />}
                            <span>{copiedPix ? "Copiado" : "Copiar"}</span>
                          </button>
                        </div>
                        <div className={styles.pixDetails}>
                          <span>Favorecido: <strong>{payment.pixHolder}</strong></span>
                          <span>Banco: <strong>{payment.bank}</strong></span>
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
                          disabled={!donorName.trim() || isCreatingCheckout || !giftQuantity}
                        >
                          <span>{isCreatingCheckout ? "Criando checkout..." : `Pagar R$ ${finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} pelo Mercado Pago`}</span>
                          <ExternalLink size={16} />
                        </button>
                        <span className={styles.mpNote}>Depois do pagamento, clique em confirmar presente.</span>
                      </div>
                    </div>

                    <div className={styles.modalActions}>
                      <button type="button" onClick={() => setSelectedGift(null)} className={styles.cancelBtn} disabled={isSubmitting}>
                        Cancelar
                      </button>
                      <button type="submit" className={styles.confirmBtn} disabled={isSubmitting || !donorName.trim() || !giftQuantity}>
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
                  <h3 className={styles.successTitle}>Muito obrigado!</h3>
                  <p className={styles.successText}>
                    Seu presente <strong>{selectedGift.title} {isCotaItem && `(${giftQuantity}x)`}</strong> foi registrado.
                  </p>
                  <p className={styles.successSubtext}>
                    Obrigado por fazer parte da nossa história com tanto carinho.
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