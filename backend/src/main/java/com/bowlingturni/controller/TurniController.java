package com.bowlingturni.controller;

import com.bowlingturni.dto.TurnoRequest;
import com.bowlingturni.dto.TurnoResponse;
import com.bowlingturni.service.TurnoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/turni")
@RequiredArgsConstructor
public class TurniController {

    private final TurnoService turnoService;

    // Vista settimanale completa — solo responsabile
    // Esempio: GET /api/turni?dal=2025-06-16&al=2025-06-22
    @GetMapping
    @PreAuthorize("hasRole('RESPONSABILE')")
    public ResponseEntity<List<TurnoResponse>> getTurniSettimana(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate al) {
        return ResponseEntity.ok(turnoService.getTurniSettimana(dal, al));
    }

    // Turni di un dipendente — accessibile anche all'addetto
    // Esempio: GET /api/turni/dipendente/1?dal=2025-06-16&al=2025-06-22
    @GetMapping("/dipendente/{dipendenteId}")
    @PreAuthorize("hasRole('RESPONSABILE') or hasRole('ADDETTO')")
    public ResponseEntity<List<TurnoResponse>> getTurniDipendente(
            @PathVariable Long dipendenteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate al) {
        return ResponseEntity.ok(turnoService.getTurniDipendente(dipendenteId, dal, al));
    }

    // Crea nuovo turno — solo responsabile
    @PostMapping
    @PreAuthorize("hasRole('RESPONSABILE')")
    public ResponseEntity<TurnoResponse> creaTurno(@Valid @RequestBody TurnoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(turnoService.creaTurno(request));
    }

    // Crea più turni in una volta (stesso orario su più giorni)
    @PostMapping("/multipli")
    @PreAuthorize("hasRole('RESPONSABILE')")
    public ResponseEntity<List<TurnoResponse>> creaTurniMultipli(@RequestBody List<TurnoRequest> requests) {
        List<TurnoResponse> turni = requests.stream()
                .map(turnoService::creaTurno)
                .toList();
        return ResponseEntity.status(HttpStatus.CREATED).body(turni);
    }

    // Modifica turno esistente — solo responsabile
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABILE')")
    public ResponseEntity<TurnoResponse> modificaTurno(
            @PathVariable Long id,
            @Valid @RequestBody TurnoRequest request) {
        return ResponseEntity.ok(turnoService.modificaTurno(id, request));
    }

    // Elimina turno — solo responsabile
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABILE')")
    public ResponseEntity<Void> eliminaTurno(@PathVariable Long id) {
        turnoService.eliminaTurno(id);
        return ResponseEntity.noContent().build();
    }
}
