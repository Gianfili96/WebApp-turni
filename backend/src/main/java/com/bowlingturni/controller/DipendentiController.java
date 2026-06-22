package com.bowlingturni.controller;

import com.bowlingturni.dto.DipendenteResponse;
import com.bowlingturni.service.DipendenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dipendenti")
@RequiredArgsConstructor
public class DipendentiController {

    private final DipendenteService dipendenteService;

    // Solo il responsabile può vedere tutti i dipendenti
    @GetMapping
    @PreAuthorize("hasRole('RESPONSABILE')")
    public ResponseEntity<List<DipendenteResponse>> getTutti() {
        return ResponseEntity.ok(dipendenteService.getTuttiAttivi());
    }

    // Sia responsabile che addetto possono vedere un dipendente per ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABILE') or hasRole('ADDETTO')")
    public ResponseEntity<DipendenteResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(dipendenteService.getById(id));
    }
}