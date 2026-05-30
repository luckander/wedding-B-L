"use client";

import { useState } from "react";
import { AlertCircle, Check, Heart, Search, User } from "lucide-react";
import { weddingConfig } from "../config";
import { CornerLeaves } from "./Decorations";
import ScrollReveal from "./ScrollReveal";
import styles from "./Rsvp.module.css";

export default function Rsvp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundGroup, setFoundGroup] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState({});
  const [allergies, setAllergies] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSearch = (event) => {
    event.preventDefault();
    const term = searchTerm.toLowerCase().trim();
    if (!term) return;

    const matchedGuest = weddingConfig.guests.find(
      (guest) =>
        guest.group.toLowerCase().includes(term) ||
        guest.name.toLowerCase().includes(term) ||
        guest.companions.some((companion) => companion.toLowerCase().includes(term))
    );

    if (matchedGuest) {
      const members = [matchedGuest.name, ...matchedGuest.companions];
      setFoundGroup({ groupName: matchedGuest.group, members });
      setSelectedGuests(Object.fromEntries(members.map((member) => [member, true])));
    } else {
      setFoundGroup(null);
    }

    setHasSearched(true);
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
    setSearchTerm("");
    setFoundGroup(null);
    setHasSearched(false);
    setSelectedGuests({});
    setAllergies("");
    setMessage("");
    setSubmitStatus(null);
  };

  return (
    <section id="rsvp" className={styles.rsvpSection}>
      <div className={styles.container}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <span className={styles.subtitle}>Confirmacao de presenca</span>
            <h2 className={styles.title}>RSVP</h2>
            <div className={styles.divider} />
            <p className={styles.headerText}>
              Procure pelo nome da familia ou grupo do convite. Em seguida, marque cada membro convidado que estara presente.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.rsvpCard}>
            <CornerLeaves position="top-left" size={60} opacity={0.15} />
            <CornerLeaves position="bottom-right" size={60} opacity={0.15} />

            {submitStatus === "success" ? (
              <div className={styles.successScreen}>
                <div className={styles.heartIconCircle}>
                  <Heart size={36} fill="var(--white)" className={styles.heartIcon} />
                </div>
                <h3 className={styles.successTitle}>Presenca confirmada</h3>
                <p className={styles.successText}>
                  Obrigado por responder com carinho. Estamos preparando tudo para viver esse dia com as pessoas que amamos.
                </p>
                <button onClick={handleReset} className={styles.resetBtn}>
                  Confirmar outro convidado
                </button>
              </div>
            ) : (
              <div className={styles.formFlow}>
                {!foundGroup && (
                  <form onSubmit={handleSearch} className={styles.searchForm}>
                    <label htmlFor="search-input" className={styles.searchLabel}>
                      Digite o nome da familia ou grupo do convite
                    </label>
                    <div className={styles.searchContainer}>
                      <input
                        id="search-input"
                        type="text"
                        placeholder="Ex: Familia Ferreira"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className={styles.searchInput}
                        disabled={isSubmitting}
                      />
                      <button type="submit" className={styles.searchBtn} disabled={isSubmitting}>
                        <Search size={18} />
                        <span>Pesquisar</span>
                      </button>
                    </div>

                    {hasSearched && !foundGroup && (
                      <div className={styles.notFound}>
                        <AlertCircle size={16} />
                        <span>Nao encontramos esse convite. Confira a grafia ou fale com os noivos.</span>
                      </div>
                    )}

                    <p className={styles.testHint}>
                      Teste com: Familia Ferreira, Familia Almeida, Amigos da Bhea, Amigos do Lucas ou Familia Ribeiro.
                    </p>
                  </form>
                )}

                {foundGroup && (
                  <form onSubmit={handleSubmit} className={styles.rsvpConfirmForm}>
                    <h3 className={styles.groupTitle}>Ola, {foundGroup.groupName}</h3>
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
                                {selectedGuests[member] ? "Confirmado" : "Nao irei"}
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
                      <button type="button" onClick={handleReset} className={styles.backBtn} disabled={isSubmitting}>
                        Voltar
                      </button>
                      <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
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
