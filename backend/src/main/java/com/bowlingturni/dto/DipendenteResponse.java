package com.bowlingturni.dto;

import com.bowlingturni.entity.Dipendente;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DipendenteResponse {

    private Long id;
    private String nome;
    private String cognome;
    private String telefono;
    private String email;
    private Boolean attivo;

    // Metodo factory statico per convertire l'entity in DTO
    public static DipendenteResponse fromEntity(Dipendente dipendente) {
        return DipendenteResponse.builder()
                .id(dipendente.getId())
                .nome(dipendente.getNome())
                .cognome(dipendente.getCognome())
                .telefono(dipendente.getTelefono())
                .email(dipendente.getUser().getEmail())
                .attivo(dipendente.getAttivo())
                .build();
    }
}