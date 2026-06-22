package com.bowlingturni.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "turni",
        indexes = {
                @Index(name = "idx_turni_dipendente_data", columnList = "dipendente_id, data_inizio"),
                @Index(name = "idx_turni_data",            columnList = "data_inizio")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dipendente_id", nullable = false)
    private Dipendente dipendente;

    @Column(name = "data_inizio", nullable = false)
    private LocalDate dataInizio;

    @Column(name = "ora_inizio", nullable = false)
    private LocalTime oraInizio;

    @Column(name = "data_fine", nullable = false)
    private LocalDate dataFine;

    @Column(name = "ora_fine", nullable = false)
    private LocalTime oraFine;

    @Column(columnDefinition = "TEXT")
    private String nota;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Restituisce il datetime completo di inizio turno.
     * Utile per il controllo sovrapposizioni nel service.
     */
    public LocalDateTime getInizioAsDateTime() {
        return LocalDateTime.of(dataInizio, oraInizio);
    }

    /**
     * Restituisce il datetime completo di fine turno.
     * Gestisce correttamente i turni notturni a cavallo della mezzanotte.
     */
    public LocalDateTime getFineAsDateTime() {
        return LocalDateTime.of(dataFine, oraFine);
    }
}
