package com.bowlingturni.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "dipendenti")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dipendente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private com.bowlingturni.entity.User user;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 100)
    private String cognome;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false)
    private Boolean attivo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "dipendente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<com.bowlingturni.entity.Turno> turni;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}