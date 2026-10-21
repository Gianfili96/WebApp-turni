package com.bowlingturni.security;

import com.bowlingturni.repository.DipendenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

// Usato nelle @PreAuthorize: verifica che il dipendente richiesto sia quello dell'utente loggato
@Component("accessoDipendente")
@RequiredArgsConstructor
public class AccessoDipendente {

    private final DipendenteRepository dipendenteRepository;

    public boolean isProprio(Long dipendenteId, Authentication authentication) {
        if (dipendenteId == null || authentication == null) return false;
        return dipendenteRepository.existsByIdAndUser_Email(dipendenteId, authentication.getName());
    }
}
