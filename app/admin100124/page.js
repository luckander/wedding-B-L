"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, RefreshCw, Trash2, X } from "lucide-react";
import styles from "./page.module.css";

const adminSections = [
  { id: "confirmados", label: "Confirmados" },
  { id: "nao-virao", label: "Nao virao" },
  { id: "rsvp-pendentes", label: "RSVP pendentes" },
  { id: "presentes", label: "Presentes" },
  { id: "recados-pendentes", label: "Recados pendentes" },
  { id: "recados-aprovados", label: "Recados aprovados" },
];

export default function AdminMessagesPage() {
  const [activeSection, setActiveSection] = useState("confirmados");
  const [messages, setMessages] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [giftContributions, setGiftContributions] = useState([]);
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

  const attendingRsvps = useMemo(
    () => rsvps.filter((rsvp) => rsvp.attending),
    [rsvps]
  );

  const declinedRsvps = useMemo(
    () => rsvps.filter((rsvp) => rsvp.attending === false),
    [rsvps]
  );

  const pendingRsvps = useMemo(
    () => rsvps.filter((rsvp) => rsvp.attending === null || rsvp.attending === undefined),
    [rsvps]
  );

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    function syncSectionFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const sectionFromUrl = params.get("secao");
      setActiveSection(
        adminSections.some((section) => section.id === sectionFromUrl)
          ? sectionFromUrl
          : "confirmados"
      );
    }

    syncSectionFromUrl();
    window.addEventListener("popstate", syncSectionFromUrl);
    return () => window.removeEventListener("popstate", syncSectionFromUrl);
  }, []);

  async function fetchAdminData() {
    setIsLoading(true);
    setError("");

    try {
      const [messagesResponse, summaryResponse] = await Promise.all([
        fetch("/api/admin100124/messages", { cache: "no-store" }),
        fetch("/api/admin100124/summary", { cache: "no-store" }),
      ]);

      if (!messagesResponse.ok || !summaryResponse.ok) {
        throw new Error("Nao foi possivel carregar o admin.");
      }

      const [messagesData, summaryData] = await Promise.all([
        messagesResponse.json(),
        summaryResponse.json(),
      ]);

      setMessages(messagesData);
      setRsvps(summaryData.rsvps || []);
      setGiftContributions(summaryData.giftContributions || []);
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

  async function updateGiftStatus(id, paymentStatus) {
    setBusyId(id);
    setError("");

    try {
      const response = await fetch("/api/gifts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentStatus }),
      });

      if (!response.ok) throw new Error("Nao foi possivel atualizar o presente.");
      const data = await response.json();

      setGiftContributions((current) =>
        current.map((contribution) => (contribution.id === id ? data.contribution : contribution))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  function changeSection(sectionId) {
    setActiveSection(sectionId);
    const nextUrl = `${window.location.pathname}?secao=${sectionId}`;
    window.history.pushState({}, "", nextUrl);
  }

  function renderActiveSection() {
    switch (activeSection) {
      case "nao-virao":
        return <RsvpSection title="Confirmaram que nao virao" emptyText="Nenhuma recusa registrada." rsvps={declinedRsvps} />;
      case "rsvp-pendentes":
        return <RsvpSection title="Pendentes de RSVP" emptyText="Nenhum RSVP pendente." rsvps={pendingRsvps} />;
      case "presentes":
        return (
          <GiftSection
            contributions={giftContributions}
            busyId={busyId}
            onConfirm={(id) => updateGiftStatus(id, "confirmed")}
            onPending={(id) => updateGiftStatus(id, "pending")}
          />
        );
      case "recados-pendentes":
        return (
          <MessageSection
            title="Recados pendentes"
            emptyText="Nenhum recado pendente."
            messages={pendingMessages}
            busyId={busyId}
            onApprove={(id) => updateApproval(id, true)}
            onHide={(id) => updateApproval(id, false)}
            onDelete={deleteMessage}
          />
        );
      case "recados-aprovados":
        return (
          <MessageSection
            title="Recados aprovados"
            emptyText="Nenhum recado aprovado ainda."
            messages={approvedMessages}
            busyId={busyId}
            onApprove={(id) => updateApproval(id, true)}
            onHide={(id) => updateApproval(id, false)}
            onDelete={deleteMessage}
          />
        );
      default:
        return <RsvpSection title="Confirmaram presenca" emptyText="Nenhuma confirmacao positiva ainda." rsvps={attendingRsvps} />;
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <span className={styles.kicker}>Admin</span>
          <h1>Recados do casamento</h1>
          <p>Aprove recados, acompanhe RSVPs e confira presentes registrados.</p>
        </div>

        <button onClick={fetchAdminData} className={styles.refreshBtn} disabled={isLoading}>
          {isLoading ? <Loader2 size={16} className={styles.spin} /> : <RefreshCw size={16} />}
          <span>Atualizar</span>
        </button>
      </section>

      {error && <div className={styles.errorBox}>{error}</div>}

      <section className={styles.summary}>
        <div>
          <strong>{pendingMessages.length}</strong>
          <span>Recados pendentes</span>
        </div>
        <div>
          <strong>{approvedMessages.length}</strong>
          <span>Recados aprovados</span>
        </div>
        <div>
          <strong>{attendingRsvps.length}</strong>
          <span>Confirmaram presença</span>
        </div>
        <div>
          <strong>{declinedRsvps.length}</strong>
          <span>Não virão</span>
        </div>
        <div>
          <strong>{pendingRsvps.length}</strong>
          <span>RSVP pendentes</span>
        </div>
        <div>
          <strong>{giftContributions.length}</strong>
          <span>Presentes registrados</span>
        </div>
      </section>

      <nav className={styles.sectionNav} aria-label="Secoes do admin">
        {adminSections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={activeSection === section.id ? styles.sectionNavActive : ""}
            onClick={() => changeSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {isLoading ? (
        <div className={styles.emptyState}>Carregando recados...</div>
      ) : (
        renderActiveSection()
      )}
    </main>
  );
}

function RsvpSection({ title, emptyText, rsvps }) {
  const groupedRsvps = groupRsvpsByFamily(rsvps);

  return (
    <section className={styles.messageSection}>
      <h2>{title}</h2>

      {rsvps.length === 0 ? (
        <div className={styles.emptyState}>{emptyText}</div>
      ) : (
        <div className={styles.familyGrid}>
          {groupedRsvps.map((family) => (
            <article key={family.id} className={styles.familyCard}>
              <div className={styles.familyHeader}>
                <strong>{family.name}</strong>
                <span>{family.members.length} {family.members.length === 1 ? "pessoa" : "pessoas"}</span>
              </div>

              <div className={styles.familyMembers}>
                {family.members.map((member) => (
                  <div key={member.id || member.name} className={styles.familyMember}>
                    <span>{member.name}</span>
                    {member.allergies && <small>Restricao: {member.allergies}</small>}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function groupRsvpsByFamily(rsvps) {
  const groups = new Map();

  rsvps.forEach((rsvp) => {
    const familyName = rsvp.groupName || rsvp.group_name || "Sem familia";
    const familyId = rsvp.familyId || rsvp.family_id || `family-name:${familyName}`;
    const existingGroup = groups.get(familyId) || { id: familyId, name: familyName, members: [] };

    existingGroup.members.push({
      id: rsvp.id,
      name: rsvp.name || rsvp.guest_name,
      allergies: rsvp.allergies,
    });

    groups.set(familyId, existingGroup);
  });

  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function GiftSection({ contributions, busyId, onConfirm, onPending }) {
  return (
    <section className={styles.messageSection}>
      <h2>Presentes registrados</h2>

      {contributions.length === 0 ? (
        <div className={styles.emptyState}>Nenhum presente registrado ainda.</div>
      ) : (
        <div className={styles.messageGrid}>
          {contributions.map((contribution) => {
            const status = contribution.payment_status || contribution.paymentStatus || "pending";
            const isConfirmed = status === "confirmed";

            return (
              <article key={contribution.id} className={styles.messageCard}>
                <div className={styles.messageMeta}>
                  <strong>{contribution.gift_title || contribution.giftTitle}</strong>
                  <span>{formatDate(contribution.created_at || contribution.date)}</span>
                </div>
                <p>Dado por: {contribution.donor_name || contribution.donorName}</p>
                <p>Valor: {formatCurrency(contribution.amount)}</p>
                <p>
                  Status:{" "}
                  <span className={isConfirmed ? styles.confirmedStatus : styles.pendingStatus}>
                    {isConfirmed ? "confirmado" : "pendente"}
                  </span>
                </p>
                {contribution.message && <p>Mensagem: {contribution.message}</p>}

                <div className={styles.actions}>
                  {!isConfirmed ? (
                    <button
                      onClick={() => onConfirm(contribution.id)}
                      disabled={busyId === contribution.id}
                      className={styles.approveBtn}
                    >
                      <Check size={15} />
                      <span>Confirmar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onPending(contribution.id)}
                      disabled={busyId === contribution.id}
                      className={styles.hideBtn}
                    >
                      <X size={15} />
                      <span>Voltar para pendente</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
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

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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
