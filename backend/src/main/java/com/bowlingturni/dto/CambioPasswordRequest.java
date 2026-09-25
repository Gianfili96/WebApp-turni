package com.bowlingturni.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CambioPasswordRequest {

    // Usata solo per il primo accesso
    @Email
    private String email;

    @NotBlank(message = "Password attuale obbligatoria")
    private String passwordAttuale;

    @NotBlank(message = "Nuova password obbligatoria")
    @Size(min = 6, message = "Minimo 6 caratteri")
    private String nuovaPassword;

    @NotBlank(message = "Conferma password obbligatoria")
    private String confermaPassword;
}
