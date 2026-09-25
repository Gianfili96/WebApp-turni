package com.bowlingturni.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import com.bowlingturni.entity.Reparto;

@Getter
@Setter
public class RegistrazioneDipendenteRequest {

    @NotBlank(message = "Nome obbligatorio")
    private String nome;

    @NotBlank(message = "Cognome obbligatorio")
    private String cognome;

    @NotBlank(message = "Email obbligatoria")
    @Email(message = "Formato email non valido")
    private String email;

    @Size(min = 6, message = "Minimo 6 caratteri")
    private String password;

    private String telefono;

    @NotNull(message = "Reparto obbligatorio")
    private Reparto reparto;
}