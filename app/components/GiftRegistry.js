"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink, Gift, Heart, Minus, Plus, X } from "lucide-react";
import { weddingConfig } from "../config";
import ScrollReveal from "./ScrollReveal";
import styles from "./GiftRegistry.module.css";
import { useParams } from "next/navigation";

// ---------------------------------------------------------------------------
// PIX Payload Generator (BACEN spec, CRC-16/CCITT-FALSE)
// -----------------------------------------------simb---------------------------
function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id, value) {
  const len = String(value.length).padStart(2, "0");
  return `${id}${len}${value}`;
}

function generatePixPayload({ key, name, city, amount, transactionId = "***" }) {
  // Merchant Account Information (ID 26)
  const mai = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", key);
  const merchantAccountInfo = tlv("26", mai);

  // Additional Data (ID 62) — transactionId inside field 05
  const txId = transactionId.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const additionalData = tlv("62", tlv("05", txId));

  // Amount formatted as "0.00" string
  const amountStr = Number(amount).toFixed(2);

  // Build payload (without CRC)
  let payload =
    tlv("00", "01") +           // Payload Format Indicator
    merchantAccountInfo +
    tlv("52", "0000") +          // Merchant Category Code
    tlv("53", "986") +           // Transaction Currency (BRL)
    tlv("54", amountStr) +       // Transaction Amount
    tlv("58", "BR") +            // Country Code
    tlv("59", name.slice(0, 25)) + // Merchant Name
    tlv("60", city.slice(0, 15)) + // Merchant City
    additionalData +
    "6304";                       // CRC placeholder

  return payload + crc16(payload);
}

export default function GiftRegistry() {
  const { gifts, payment } = weddingConfig;

  const params = useParams();
  const inviteSlug = params?.slug || "";

  const [toast, setToast] = useState({ show: false, message: "" });
  const triggerToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { show: false, message: "" } : prev));
    }, 3500);
  };

  // Ordena os presentes com base na prioridade atribuída no código
  const sortedGifts = [...gifts].sort((a, b) => (a.priority || 999) - (b.priority || 999));

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedGift, setSelectedGift] = useState(null);
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [contributionSuccess, setContributionSuccess] = useState(false);
  const [givenGiftIds, setGivenGiftIds] = useState({});

  // NOVO ESTADO: Quantidade de cotas selecionadas pelo convidado
  const [giftQuantity, setGiftQuantity] = useState(1);

  const [visibleCount, setVisibleCount] = useState(5);

  const categories = ["Todos", ...new Set(sortedGifts.map((gift) => gift.category))];

  const filteredGifts =
    selectedCategory === "Todos" ? sortedGifts : sortedGifts.filter((gift) => gift.category === selectedCategory);

  const displayedGifts = filteredGifts.slice(0, visibleCount);

  const isCotaGift = (gift) => Boolean(gift?.isCota || gift?.title.toLowerCase().includes("cota"));

  // Identifica se o item atual funciona como Cota (ex: se o nome contiver "Cota")
  const isCotaItem = selectedGift ? isCotaGift(selectedGift) : false;

  // Calcula o preço final dinamicamente com base na quantidade
  const finalPrice = selectedGift ? selectedGift.price * giftQuantity : 0;

  useEffect(() => {
    async function fetchGiftStatuses() {
      try {
        const response = await fetch("/api/gifts", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        setGivenGiftIds(data.byGiftId || {});
      } catch (error) {
        console.error("Error fetching gift statuses:", error);
      }
    }

    fetchGiftStatuses();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setVisibleCount(5);
  };

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  const handleCopyPix = async () => {
    try {
      const pixCode = generatePixPayload({
        key: payment.pixKey,
        name: payment.pixHolder,
        city: "ALHANDRA",
        amount: finalPrice,
        transactionId: "PresenteCasamento",
      });

      await navigator.clipboard.writeText(pixCode);
      setCopiedPix(true);
      triggerToast("Código Pix Copia e Cola copiado com sucesso!");
      setTimeout(() => setCopiedPix(false), 2500);
    } catch (error) {
      console.error("Error generating Pix code:", error);
      triggerToast("Erro ao gerar o código Pix.");
    }
  };

  const handleOpenModal = (gift) => {
    if (isGiftGiven(gift)) return;
    setSelectedGift(gift);
    setGiftQuantity(1); // Reseta a quantidade para 1 sempre que abrir um novo presente
    setDonorName("");
    setDonorMessage("");
    setContributionSuccess(false);
    setCopiedPix(false);
    // Lock body scroll while modal is open
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedGift(null);
    document.body.style.overflow = "";
  };

  const isGiftGiven = (gift) => !isCotaGift(gift) && givenGiftIds[gift.id];

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
          inviteSlug: inviteSlug, // Passa o slug do convite
        }),
      });

      if (donorMessage.trim()) {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: donorName,
            message: `Recadinho com presente: ${donorMessage}`,
          }),
        });
      }

      if (response.ok) {
        if (!isCotaItem) {
          setGivenGiftIds((current) => ({ ...current, [selectedGift.id]: true }));
        }
        setContributionSuccess(true);
      }
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
            <h2 className={styles.title}>Presentes simbólicos</h2>
            <div className={styles.divider} />
            <p className={styles.headerText}>
              Sua presença é nosso maior presente! Mas, se assim desejar, escolha um presente para nos presentear. Você poderá finalizar o gesto através de Pix ou pelo Mercado Pago e nos enviar um recadinho junto a ele.
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
              <div className={`${styles.giftCard} ${isGiftGiven(gift) ? styles.giftCardGiven : ""}`}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={gift.image}
                    alt={gift.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    className={styles.giftImg}
                  />
                  <span className={styles.categoryTag}>{gift.category}</span>
                  {isGiftGiven(gift) && (
                    <div className={styles.givenOverlay}>
                      <Check size={24} />
                      <span>Já presenteado</span>
                    </div>
                  )}
                </div>
                <div className={styles.giftContent}>
                  <h3 className={styles.giftTitle}>{gift.title}</h3>
                  <div className={styles.cardFooter}>
                    <span className={styles.giftPrice}>
                      {isCotaGift(gift) ? "Cota: " : ""}
                      R$ {gift.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleOpenModal(gift)}
                      className={styles.giftBtn}
                      disabled={isGiftGiven(gift)}
                    >
                      <Gift size={15} />
                      <span>{isGiftGiven(gift) ? "Já dado" : "Presentear"}</span>
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
          <div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
            <div className={styles.modalCard}>
              <button onClick={handleCloseModal} className={styles.closeBtn} aria-label="Fechar">
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
                        <a
                          href="https://link.mercadopago.com.br/bheatrizelucas"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.mpBtn}
                        >
                          <span>Pagar com Cartão (Mercado Pago)</span>
                          <ExternalLink size={16} />
                        </a>
                        <span className={styles.mpNote}>Depois de pagar no site, clique em "Eu dei esse presente" para confirmar.</span>
                      </div>
                    </div>

                    <div className={styles.modalActions}>
                      <button type="button" onClick={handleCloseModal} className={styles.cancelBtn} disabled={isSubmitting}>
                        Cancelar
                      </button>
                      <button type="submit" className={styles.confirmBtn} disabled={isSubmitting || !donorName.trim() || !giftQuantity}>
                        {isSubmitting ? "Registrando..." : "Eu dei esse presente"}
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
                  <button onClick={handleCloseModal} className={styles.closeSuccessBtn}>
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toast.show && (
        <div className={`${styles.toastContainer} ${toast.show ? styles.toastActive : ""}`}>
          <Check size={18} className={styles.toastIcon} />
          <span>{toast.message}</span>
        </div>
      )}
    </section>
  );
}
