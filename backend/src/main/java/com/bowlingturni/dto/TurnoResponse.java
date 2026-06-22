package com.bowlingturni.dto;

import com.bowlingturni.entity.Turno;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class TurnoResponse {

    private Long id;
    private Long dipendenteId;
    private String dipendenteNome;
    private String dipendenteCognome;
    private LocalDate dataInizio;
    private LocalTime oraInizio;
    private LocalDate dataFine;
    private LocalTime oraFine;
    private String nota;

    // Metodo factory statico per convertire l'entity in DTO
    public static TurnoResponse fromEntity(Turno turno) {
        return TurnoResponse.builder()
                .id(turno.getId())
                .dipendenteId(turno.getDipendente().getId())
                .dipendenteNome(turno.getDipendente().getNome())
                .dipendenteCognome(turno.getDipendente().getCognome())
                .dataInizio(turno.getDataInizio())
                .oraInizio(turno.getOraInizio())
                .dataFine(turno.getDataFine())
                .oraFine(turno.getOraFine())
                .nota(turno.getNota())
                .build();
    }
}