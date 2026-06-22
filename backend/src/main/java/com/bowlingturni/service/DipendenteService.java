package com.bowlingturni.service;

import com.bowlingturni.dto.DipendenteResponse;
import com.bowlingturni.repository.DipendenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DipendenteService {

    private final DipendenteRepository dipendenteRepository;

    // Restituisce tutti i dipendenti attivi
    public List<DipendenteResponse> getTuttiAttivi() {
        return dipendenteRepository.findByAttivoTrue()
                .stream()
                .map(DipendenteResponse::fromEntity)
                .toList();
    }

    // Restituisce un dipendente per ID
    public DipendenteResponse getById(Long id) {
        return dipendenteRepository.findById(id)
                .map(DipendenteResponse::fromEntity)
                .orElseThrow(() -> new RuntimeException("Dipendente non trovato con id: " + id));
    }
}