"use client";

import React, { useState, useEffect } from "react";
import ScrollReveal from "./ScrollReveal";
import styles from "./Guestbook.module.css";
import { MessageSquare, Heart, Send, Check, AlertCircle } from "lucide-react";

export default function Guestbook() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch approved messages
  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, message }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setName("");
        setMessage("");
        // Wait 5 seconds and reset success message
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(true);
      }
    } catch (err) {
      setSubmitError(true);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format date nicely
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    } catch (e) {
      return "";
    }
  };

  return (
    <section id="mural" className={styles.guestbookSection}>
      <div className={styles.container}>
        
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <span className={styles.subtitle}>Mural de Recados</span>
            <h2 className={styles.title}>Deixe seu Recado</h2>
            <div className={styles.divider}></div>
            <p className={styles.headerText}>
              Queremos guardar com carinho as palavras e os desejos felizes de quem amamos. Deixe uma mensagem para o nosso mural de casamento!
            </p>
          </div>
        </ScrollReveal>

        <div className={styles.contentGrid}>
          {/* Form Card */}
          <ScrollReveal>
            <div className={styles.formCard}>
              <h3 className={styles.cardTitle}>
                <MessageSquare size={18} />
                <span>Escrever mensagem</span>
              </h3>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="guestbook-name" className={styles.inputLabel}>
                    Seu Nome *
                  </label>
                  <input
                    id="guestbook-name"
                    type="text"
                    required
                    placeholder="Ex: Ana Maria..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.textInput}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="guestbook-msg" className={styles.inputLabel}>
                    Mensagem *
                  </label>
                  <textarea
                    id="guestbook-msg"
                    rows={4}
                    required
                    placeholder="Deixe seus votos de amor e felicidade para nós..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={styles.textareaInput}
                    disabled={isSubmitting}
                  />
                </div>

                {submitSuccess && (
                  <div className={styles.successMessage}>
                    <Check size={16} />
                    <span>Recado enviado com sucesso! Aparecerá no mural logo após a aprovação dos noivos. 🤍</span>
                  </div>
                )}

                {submitError && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>Houve um erro ao enviar seu recado. Tente novamente.</span>
                  </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  <Send size={16} />
                  <span>{isSubmitting ? "Enviando..." : "Enviar Recado"}</span>
                </button>
              </form>
            </div>
          </ScrollReveal>

          {/* Messages Feed */}
          <ScrollReveal>
            <div className={styles.feedCard}>
              <h3 className={styles.cardTitle}>
                <Heart size={18} />
                <span>Recados dos Convidados</span>
              </h3>

              <div className={styles.messagesList}>
                {isLoading ? (
                  <div className={styles.loading}>Carregando mensagens...</div>
                ) : messages.length === 0 ? (
                  <div className={styles.emptyFeed}>
                    Seja o primeiro a deixar uma mensagem de carinho para nós! ✨
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={styles.messageItem}>
                      <div className={styles.messageHeader}>
                        <strong className={styles.author}>{msg.name}</strong>
                        <span className={styles.date}>{formatDate(msg.date)}</span>
                      </div>
                      <p className={styles.text}>"{msg.message}"</p>
                      <div className={styles.messageDecoration}>
                        <Heart size={10} fill="var(--dusty-pink)" color="var(--dusty-pink)" />
                      </div>
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
