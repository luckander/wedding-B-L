"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Check, Heart, Search, User, Loader2 } from "lucide-react";
import { CornerLeaves } from "./Decorations";
import ScrollReveal from "./ScrollReveal";
import styles from "./Rsvp.module.css";

export default function Rsvp({ inviteSlug }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundGroup, setFoundGroup] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState({});
  const [guestIds, setGuestIds] = useState({});
  const [allergies, setAllergies] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlug, setIsLoadingSlug] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Carrega convidados do slug dinâmico na montagem do componente
  useEffect(() => {
    if (inviteSlug) {
      setIsLoadingSlug(true);
      fetch(`/api/rsvp/search?slug=${encodeURIComponent(inviteSlug)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.found) {
            const members = data.members.map((m) => m.name);
            setFoundGroup({ groupName: data.family.name, members });

            const ids = {};
            const selected = {};
            let savedAllergies = "";
            let savedMessage = "";

            data.members.forEach((m) => {
              ids[m.name] = m.id;
              // se já respondeu, usa o salvo; senão, default para true (confirmado)
              selected[m.name] = m.attending !== null ? m.attending : true;
              if (m.allergies && !savedAllergies) savedAllergies = m.allergies;
              if (m.message && !savedMessage) savedMessage = m.message;
            });

            setGuestIds(ids);
            setSelectedGuests(selected);
            setAllergies(savedAllergies);
            setMessage(savedMessage);
          }
          setHasSearched(true);
        })
        .catch((err) => console.error("Erro ao buscar convite pelo slug:", err))
        .finally(() => setIsLoadingSlug(false));
    }
  }, [inviteSlug]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch(`/api/rsvp/search?query=${encodeURIComponent(term)}`);
      const data = await res.json();

      if (data.success && data.found) {
        const members = data.members.map((m) => m.name);
        setFoundGroup({ groupName: data.family.name, members });

        const ids = {};
        const selected = {};
        let savedAllergies = "";
        let savedMessage = "";

        data.members.forEach((m) => {
          ids[m.name] = m.id;
          selected[m.name] = m.attending !== null ? m.attending : true;
          if (m.allergies && !savedAllergies) savedAllergies = m.allergies;
          if (m.message && !savedMessage) savedMessage = m.message;
        });

        setGuestIds(ids);
        setSelectedGuests(selected);
        setAllergies(savedAllergies);
        setMessage(savedMessage);
      } else {
        setFoundGroup(null);
      }
      setHasSearched(true);
    } catch (error) {
      console.error("Erro ao buscar:", error);
      setFoundGroup(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (name) => {
    setSelectedGuests((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await Promise.all(
        foundGroup.members.map((member) => {
          const attending = !!selectedGuests[member];

          return fetch("/api/rsvp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: guestIds[member],
              name: member,
              groupName: foundGroup.groupName,
              attending,
              guestsCount: attending ? 1 : 0,
              companions: [],
              allergies: attending ? allergies : "",
              message: member === foundGroup.members[0] ? message : "",
            }),
          });
        })
      );

      setSubmitStatus("success");
    } catch (error) {
      console.error(error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitStatus(null);
    if (!inviteSlug) {
      setSearchTerm("");
      setFoundGroup(null);
      setHasSearched(false);
      setSelectedGuests({});
      setGuestIds({});
      setAllergies("");
      setMessage("");
    }
  };

  return (
    <section id="rsvp" className={styles.rsvpSection}>
      <div className={styles.container}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <h2 className={styles.title}>Rsvp</h2>
            <div className={styles.divider} />
            <p className={styles.headerText}>
              {inviteSlug
                ? "Confirme a presença dos membros do seu convite marcando a caixa de cada um."
                : "Procure pelo nome da familia ou grupo do convite. Em seguida, marque cada membro convidado que estará presente."}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.rsvpCard}>
            <CornerLeaves position="top-left" size={60} opacity={0.15} />
            <CornerLeaves position="bottom-right" size={60} opacity={0.15} />

            {isLoadingSlug ? (
              <div className={styles.successScreen} style={{ minHeight: "150px" }}>
                <Loader2 className="animate-spin" size={36} color="var(--sage)" style={{ margin: "2rem auto" }} />
                <p className={styles.successText}>Carregando seu convite...</p>
              </div>
            ) : submitStatus === "success" ? (
              <div className={styles.successScreen}>
                <div className={styles.heartIconCircle}>
                  <Heart size={36} fill="var(--white)" className={styles.heartIcon} />
                </div>
                <h3 className={styles.successTitle}>Resposta Enviada</h3>
                <p className={styles.successText}>
                  Obrigado, {foundGroup?.groupName || "familia"}, por responder com carinho. Estamos preparando tudo para viver esse dia com as pessoas que amamos.
                </p>
                <button onClick={handleReset} className={styles.resetBtn}>
                  {inviteSlug ? "Editar resposta" : "Confirmar outro convidado"}
                </button>
              </div>
            ) : (
              <div className={styles.formFlow}>
                {!foundGroup && (
                  inviteSlug ? (
                    <div style={{ textAlign: "center", padding: "1rem 0" }}>
                      <div className={styles.heartIconCircle} style={{ margin: "0 auto 1.5rem" }}>
                        <Heart size={36} fill="var(--white)" className={styles.heartIcon} />
                      </div>
                      <h3 style={{ fontFamily: "var(--font-oldstandard), serif", fontSize: "1.8rem", color: "var(--sage)", marginBottom: "1rem" }}>
                        Convite Não Encontrado
                      </h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "450px", margin: "0 auto 1.5rem" }}>
                        Não conseguimos localizar o convite com o link informado. Por favor, verifique a grafia ou entre em contato com os noivos.
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "var(--dust-blue)", fontStyle: "italic" }}>
                        Dúvidas? Fale com a Bhea ou com o Lucas.
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "1rem 0" }}>
                      <div className={styles.heartIconCircle} style={{ margin: "0 auto 1.5rem" }}>
                        <Heart size={36} fill="var(--white)" className={styles.heartIcon} />
                      </div>
                      <h3 style={{ fontFamily: "var(--font-oldstandard), serif", fontSize: "1.8rem", color: "var(--sage)", marginBottom: "1rem" }}>
                        Acesso Restrito
                      </h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "450px", margin: "0 auto 1.5rem" }}>
                        Para confirmar sua presença, utilize o link personalizado que enviamos para você.
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "var(--dust-blue)", fontStyle: "italic" }}>
                        Por favor, use o link do seu convite ou entre em contato com os noivos.
                      </p>
                    </div>
                  )
                )}

                {foundGroup && (
                  <form onSubmit={handleSubmit} className={styles.rsvpConfirmForm}>
                    <h3 className={styles.groupTitle}>Olá, {foundGroup.groupName}</h3>
                    <p className={styles.groupInstructions}>
                      Marque abaixo quem ira participar da celebracao.
                    </p>

                    <div className={styles.guestsList}>
                      {foundGroup.members.map((member) => (
                        <div key={member} className={styles.guestItem}>
                          <div className={styles.guestNameContainer}>
                            <User size={16} className={styles.userIcon} />
                            <span className={styles.guestName}>{member}</span>
                          </div>

                          <label className={styles.switchLabel}>
                            <input
                              type="checkbox"
                              checked={!!selectedGuests[member]}
                              onChange={() => handleCheckboxChange(member)}
                              className={styles.hiddenCheckbox}
                            />
                            <div className={`${styles.customSwitch} ${selectedGuests[member] ? styles.active : ""}`}>
                              <span className={styles.switchKnob} />
                              <span className={styles.switchText}>
                                {selectedGuests[member] ? "Confirmado" : "Não irei"}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="allergies-input" className={styles.inputLabel}>
                        Restricao alimentar ou alergia
                      </label>
                      <input
                        id="allergies-input"
                        type="text"
                        placeholder="Ex: vegetariano, sem gluten, alergia a camarao"
                        value={allergies}
                        onChange={(event) => setAllergies(event.target.value)}
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="message-input" className={styles.inputLabel}>
                        Recado para os noivos
                      </label>
                      <textarea
                        id="message-input"
                        rows={3}
                        placeholder="Escreva uma mensagem especial"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        className={styles.textareaInput}
                      />
                    </div>

                    {submitStatus === "error" && (
                      <div className={styles.errorMessage}>
                        <AlertCircle size={16} />
                        <span>Houve um erro ao enviar. Tente novamente.</span>
                      </div>
                    )}

                    <div className={styles.formActions}>
                      {!inviteSlug && (
                        <button type="button" onClick={handleReset} className={styles.backBtn} disabled={isSubmitting}>
                          Voltar
                        </button>
                      )}
                      <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                        style={{ marginLeft: inviteSlug ? "auto" : "0" }}
                      >
                        {isSubmitting ? (
                          "Enviando..."
                        ) : (
                          <>
                            <Check size={18} />
                            <span>Confirmar presenca</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
