package com.bowlingturni.dto;

import com.bowlingturni.entity.Turno;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class TurnoRequest {

    @NotNull(message = "Dipendente obbligatorio")
    private Long dipendenteId;

    @NotNull(message = "Data inizio obbligatoria")
    private LocalDate dataInizio;

    //@NotNull(message = "Ora inizio obbligatoria")
    private LocalTime oraInizio;

    @NotNull(message = "Data fine obbligatoria")
    private LocalDate dataFine;

    //@NotNull(message = "Ora fine obbligatoria")
    private LocalTime oraFine;

    @NotNull(message = "Tipo obbligatorio")
    private Turno.TipoTurno tipo;

    private String nota;
}