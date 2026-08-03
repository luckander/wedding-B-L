"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, RefreshCw, Trash2, X } from "lucide-react";
import styles from "./page.module.css";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const pendingMessages = useMemo(
    () => messages.filter((message) => !message.approved),
    [messages]
  );

  const approvedMessages = useMemo(
    () => messages.filter((message) => message.approved),
    [messages]
  );

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin100124/messages", { cache: "no-store" });
      if (!response.ok) throw new Error("Nao foi possivel carregar os recados.");
      setMessages(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateApproval(id, approved) {
    setBusyId(id);
    setError("");

    try {
      const response = await fetch("/api/admin100124/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      });

      if (!response.ok) throw new Error("Nao foi possivel atualizar o recado.");
      const data = await response.json();

      setMessages((current) =>
        current.map((message) => (message.id === id ? data.message : message))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function deleteMessage(id) {
    setBusyId(id);
    setError("");

    try {
      const response = await fetch(`/api/admin100124/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Nao foi possivel excluir o recado.");
      setMessages((current) => current.filter((message) => message.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <span className={styles.kicker}>Admin</span>
          <h1>Recados do casamento</h1>
          <p>Aprove os recados para que aparecam no mural publico.</p>
        </div>

        <button onClick={fetchMessages} className={styles.refreshBtn} disabled={isLoading}>
          {isLoading ? <Loader2 size={16} className={styles.spin} /> : <RefreshCw size={16} />}
          <span>Atualizar</span>
        </button>
      </section>

      {error && <div className={styles.errorBox}>{error}</div>}

      <section className={styles.summary}>
        <div>
          <strong>{pendingMessages.length}</strong>
          <span>Pendentes</span>
        </div>
        <div>
          <strong>{approvedMessages.length}</strong>
          <span>Aprovados</span>
        </div>
      </section>

      {isLoading ? (
        <div className={styles.emptyState}>Carregando recados...</div>
      ) : (
        <>
          <MessageSection
            title="Pendentes"
            emptyText="Nenhum recado pendente."
            messages={pendingMessages}
            busyId={busyId}
            onApprove={(id) => updateApproval(id, true)}
            onHide={(id) => updateApproval(id, false)}
            onDelete={deleteMessage}
          />

          <MessageSection
            title="Aprovados"
            emptyText="Nenhum recado aprovado ainda."
            messages={approvedMessages}
            busyId={busyId}
            onApprove={(id) => updateApproval(id, true)}
            onHide={(id) => updateApproval(id, false)}
            onDelete={deleteMessage}
          />
        </>
      )}
    </main>
  );
}

function MessageSection({ title, emptyText, messages, busyId, onApprove, onHide, onDelete }) {
  return (
    <section className={styles.messageSection}>
      <h2>{title}</h2>

      {messages.length === 0 ? (
        <div className={styles.emptyState}>{emptyText}</div>
      ) : (
        <div className={styles.messageGrid}>
          {messages.map((message) => (
            <article key={message.id} className={styles.messageCard}>
              <div className={styles.messageMeta}>
                <strong>{message.name}</strong>
                <span>{formatDate(message.created_at || message.date)}</span>
              </div>
              <p>{message.message}</p>

              <div className={styles.actions}>
                {!message.approved ? (
                  <button
                    onClick={() => onApprove(message.id)}
                    disabled={busyId === message.id}
                    className={styles.approveBtn}
                  >
                    <Check size={15} />
                    <span>Aprovar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onHide(message.id)}
                    disabled={busyId === message.id}
                    className={styles.hideBtn}
                  >
                    <X size={15} />
                    <span>Ocultar</span>
                  </button>
                )}

                <button
                  onClick={() => onDelete(message.id)}
                  disabled={busyId === message.id}
                  className={styles.deleteBtn}
                >
                  <Trash2 size={15} />
                  <span>Excluir</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
