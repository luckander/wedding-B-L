"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Heart, MessageSquare, Send } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import styles from "./Guestbook.module.css";

export default function Guestbook() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch("/api/messages");
        if (response.ok) setMessages(await response.json());
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      if (!response.ok) throw new Error("Could not save message");

      setSubmitSuccess(true);
      setName("");
      setMessage("");
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError(true);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <section id="mural" className={styles.guestbookSection}>
      <div className={styles.container}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <span className={styles.subtitle}>Mural de recados</span>
            <h2 className={styles.title}>Deixe seu carinho</h2>
            <div className={styles.divider} />
            <p className={styles.headerText}>
              As mensagens entram como pendentes e aparecem no mural depois da aprovacao dos noivos.
            </p>
          </div>
        </ScrollReveal>

        <div className={styles.contentGrid}>
          <ScrollReveal>
            <div className={styles.panel}>
              <h3 className={styles.cardTitle}>
                <MessageSquare size={18} />
                <span>Escrever mensagem</span>
              </h3>

              <form onSubmit={handleSubmit} className={styles.form}>
                <label className={styles.inputLabel} htmlFor="guestbook-name">
                  Seu nome
                </label>
                <input
                  id="guestbook-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={styles.textInput}
                  placeholder="Ex: Ana Maria"
                  disabled={isSubmitting}
                  required
                />

                <label className={styles.inputLabel} htmlFor="guestbook-message">
                  Mensagem
                </label>
                <textarea
                  id="guestbook-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className={styles.textareaInput}
                  placeholder="Escreva seus votos para Bheatriz e Lucas"
                  rows={4}
                  disabled={isSubmitting}
                  required
                />

                {submitSuccess && (
                  <div className={styles.successMessage}>
                    <Check size={16} />
                    <span>Recado enviado. Ele aparecera apos aprovacao.</span>
                  </div>
                )}

                {submitError && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>Nao foi possivel enviar agora. Tente novamente.</span>
                  </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  <Send size={16} />
                  <span>{isSubmitting ? "Enviando..." : "Enviar recado"}</span>
                </button>
              </form>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className={styles.panel}>
              <h3 className={styles.cardTitle}>
                <Heart size={18} />
                <span>Recados aprovados</span>
              </h3>

              <div className={styles.messagesList}>
                {isLoading ? (
                  <div className={styles.emptyFeed}>Carregando mensagens...</div>
                ) : messages.length === 0 ? (
                  <div className={styles.emptyFeed}>Ainda nao ha recados publicados.</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={styles.messageItem}>
                      <div className={styles.messageHeader}>
                        <strong>{msg.name}</strong>
                        <span>{formatDate(msg.date)}</span>
                      </div>
                      <p>"{msg.message}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
