package com.bowlingturni.controller;

import com.bowlingturni.dto.DipendenteResponse;
import com.bowlingturni.dto.RegistrazioneDipendenteRequest;
import com.bowlingturni.service.DipendenteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    // Solo il responsabile può registrare un nuovo dipendente
    @PostMapping
    @PreAuthorize("hasRole('RESPONSABILE')")
    public ResponseEntity<DipendenteResponse> registraDipendente(
            @Valid @RequestBody RegistrazioneDipendenteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dipendenteService.registraDipendente(request));
    }

    // Modifica dipendente
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABILE')")
    public ResponseEntity<DipendenteResponse> modificaDipendente(
            @PathVariable Long id,
            @Valid @RequestBody RegistrazioneDipendenteRequest request) {
        return ResponseEntity.ok(dipendenteService.modificaDipendente(id, request));
    }

    // Elimina dipendente
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABILE')")
    public ResponseEntity<Void> eliminaDipendente(@PathVariable Long id) {
        dipendenteService.eliminaDipendente(id);
        return ResponseEntity.noContent().build();
    }
}