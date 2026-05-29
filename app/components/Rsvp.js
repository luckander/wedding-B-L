"use client";

import React, { useState } from "react";
import { weddingConfig } from "../config";
import { CornerLeaves } from "./Decorations";
import ScrollReveal from "./ScrollReveal";
import styles from "./Rsvp.module.css";
import { Search, Check, AlertCircle, Heart, User } from "lucide-react";

export default function Rsvp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundGroup, setFoundGroup] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState({}); // { [guestName]: boolean }
  const [allergies, setAllergies] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Search case-insensitively in mock guest list
    const term = searchTerm.toLowerCase().trim();
    
    // Check for direct match or family companions match
    const matchedGuest = weddingConfig.guests.find(
      (g) => 
        g.name.toLowerCase().includes(term) || 
        g.companions.some((companion) => companion.toLowerCase().includes(term))
    );

    if (matchedGuest) {
      // Find all guests belonging to the same family group
      const allGroupMembers = [matchedGuest.name, ...matchedGuest.companions];
      
      setFoundGroup({
        groupName: matchedGuest.group,
        members: allGroupMembers,
      });

      // Default all members to checked (present)
      const initialSelection = {};
      allGroupMembers.forEach((m) => {
        initialSelection[m] = true;
      });
      setSelectedGuests(initialSelection);
    } else {
      setFoundGroup(null);
    }
    setHasSearched(true);
  };

  const handleCheckboxChange = (name) => {
    setSelectedGuests((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Send RSVP for each member of the group
      const promises = foundGroup.members.map((member) => {
        const isAttending = !!selectedGuests[member];
        
        return fetch("/api/rsvp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: member,
            attending: isAttending,
            guestsCount: isAttending ? 1 : 0,
            companions: [], // companions are flattened in our schema
            allergies: isAttending ? allergies : "",
            // Attach message to the main searched guest only, or all
            message: member === foundGroup.members[0] ? message : "", 
          }),
        });
      });

      await Promise.all(promises);
      setSubmitStatus("success");
    } catch (err) {
      console.error(err);
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
            <span className={styles.subtitle}>Confirmação de Presença</span>
            <h2 className={styles.title}>Confirmar RSVP</h2>
            <div className={styles.divider}></div>
            <p className={styles.headerText}>
              Por favor, confirme sua presença até o dia <strong>15 de Agosto de 2026</strong> para que possamos organizar tudo com muito carinho.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.rsvpCard}>
            {/* Elegant corner SVG decorations */}
            <CornerLeaves position="top-left" size={60} opacity={0.15} />
            <CornerLeaves position="bottom-right" size={60} opacity={0.15} />

            {submitStatus === "success" ? (
              // Success Screen
              <div className={styles.successScreen}>
                <div className={styles.heartIconCircle}>
                  <Heart size={36} fill="var(--white)" className={styles.heartIcon} />
                </div>
                <h3 className={styles.successTitle}>Presença Confirmada!</h3>
                <p className={styles.successText}>
                  Muito obrigado por confirmar sua presença. O seu carinho significa o mundo para nós! Mal podemos esperar para celebrar esse momento inesquecível juntos no <strong>Haras Pôr do Sol</strong>.
                </p>
                <button onClick={handleReset} className={styles.resetBtn}>
                  Confirmar outro convidado
                </button>
              </div>
            ) : (
              // RSVP Form Flow
              <div className={styles.formFlow}>
                {!foundGroup && (
                  // Step 1: Search by Name
                  <form onSubmit={handleSearch} className={styles.searchForm}>
                    <label htmlFor="search-input" className={styles.searchLabel}>
                      Digite seu nome completo (ou de um familiar):
                    </label>
                    <div className={styles.searchContainer}>
                      <input
                        id="search-input"
                        type="text"
                        placeholder="Ex: Maria Ferreira..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        <span>Não encontramos seu nome na lista. Verifique a grafia ou fale diretamente conosco!</span>
                      </div>
                    )}
                  </form>
                )}

                {foundGroup && (
                  // Step 2: Confirm Attendance
                  <form onSubmit={handleSubmit} className={styles.rsvpConfirmForm}>
                    <h3 className={styles.groupTitle}>Olá, {foundGroup.groupName}!</h3>
                    <p className={styles.groupInstructions}>
                      Selecione quem irá nos dar a honra da presença nesse dia maravilhoso:
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
                              <span className={styles.switchKnob}></span>
                              <span className={styles.switchText}>
                                {selectedGuests[member] ? "Confirmado" : "Não irei"}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Additional Options */}
                    <div className={styles.formGroup}>
                      <label htmlFor="allergies-input" className={styles.inputLabel}>
                        Alguma restrição alimentar ou alergia? (Opcional):
                      </label>
                      <input
                        id="allergies-input"
                        type="text"
                        placeholder="Ex: Vegano, sem glúten, alergia a camarão..."
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="message-input" className={styles.inputLabel}>
                        Deixe um recado carinhoso para os noivos:
                      </label>
                      <textarea
                        id="message-input"
                        rows={3}
                        placeholder="Escreva uma mensagem especial para nós..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={styles.textareaInput}
                      />
                    </div>

                    {submitStatus === "error" && (
                      <div className={styles.errorMessage}>
                        <AlertCircle size={16} />
                        <span>Houve um erro ao enviar. Por favor, tente novamente.</span>
                      </div>
                    )}

                    <div className={styles.formActions}>
                      <button type="button" onClick={handleReset} className={styles.backBtn} disabled={isSubmitting}>
                        Voltar à busca
                      </button>
                      <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? (
                          "Enviando..."
                        ) : (
                          <>
                            <Check size={18} />
                            <span>Confirmar Presença</span>
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
