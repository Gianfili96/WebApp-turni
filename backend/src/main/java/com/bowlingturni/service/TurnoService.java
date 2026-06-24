package com.bowlingturni.service;

import com.bowlingturni.dto.TurnoRequest;
import com.bowlingturni.dto.TurnoResponse;
import com.bowlingturni.entity.Dipendente;
import com.bowlingturni.entity.Turno;
import com.bowlingturni.exception.SovrapposizioneTurnoException;
import com.bowlingturni.repository.DipendenteRepository;
import com.bowlingturni.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TurnoService {

    private final TurnoRepository      turnoRepository;
    private final DipendenteRepository dipendenteRepository;

    // ----------------------------------------------------------------
    // READ
    // ----------------------------------------------------------------

    // Tutti i turni della settimana (vista responsabile)
    public List<TurnoResponse> getTurniSettimana(LocalDate dal, LocalDate al) {
        return turnoRepository
                .findByDataInizioBetweenOrderByDataInizioAscOraInizioAsc(dal, al)
                .stream()
                .map(TurnoResponse::fromEntity)
                .toList();
    }

    // Turni di un singolo dipendente nella settimana (vista addetto)
    public List<TurnoResponse> getTurniDipendente(Long dipendenteId, LocalDate dal, LocalDate al) {
        return turnoRepository
                .findByDipendenteIdAndDataInizioBetweenOrderByDataInizioAscOraInizioAsc(dipendenteId, dal, al)
                .stream()
                .map(TurnoResponse::fromEntity)
                .toList();
    }

    // ----------------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------------

    @Transactional
    public TurnoResponse creaTurno(TurnoRequest request) {
        Dipendente dipendente = trovaDipendente(request.getDipendenteId());
        validaOrari(request);

        if (request.getTipo() == Turno.TipoTurno.TURNO) {
            controllaSovrapposizione(request, 0L);
        }

        Turno turno = Turno.builder()
                .dipendente(dipendente)
                .dataInizio(request.getDataInizio())
                .oraInizio(request.getOraInizio())
                .dataFine(request.getDataFine())
                .oraFine(request.getOraFine())
                .nota(request.getNota())
                .tipo(request.getTipo())
                .build();

        return TurnoResponse.fromEntity(turnoRepository.save(turno));
    }

    // ----------------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------------

    @Transactional
    public TurnoResponse modificaTurno(Long id, TurnoRequest request) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno non trovato con id: " + id));

        Dipendente dipendente = trovaDipendente(request.getDipendenteId());
        validaOrari(request);

        if (request.getTipo() == Turno.TipoTurno.TURNO) {
            controllaSovrapposizione(request, id);
        }

        turno.setDipendente(dipendente);
        turno.setDataInizio(request.getDataInizio());
        turno.setOraInizio(request.getOraInizio());
        turno.setDataFine(request.getDataFine());
        turno.setOraFine(request.getOraFine());
        turno.setNota(request.getNota());
        turno.setTipo(request.getTipo());

        return TurnoResponse.fromEntity(turnoRepository.save(turno));
    }

    // ----------------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------------

    @Transactional
    public void eliminaTurno(Long id) {
        if (!turnoRepository.existsById(id)) {
            throw new RuntimeException("Turno non trovato con id: " + id);
        }
        turnoRepository.deleteById(id);
    }

    // ----------------------------------------------------------------
    // METODI PRIVATI
    // ----------------------------------------------------------------

    private Dipendente trovaDipendente(Long dipendenteId) {
        return dipendenteRepository.findById(dipendenteId)
                .orElseThrow(() -> new RuntimeException("Dipendente non trovato con id: " + dipendenteId));
    }

    private void validaOrari(TurnoRequest request) {
        if (request.getTipo() != Turno.TipoTurno.TURNO) return;

        if (request.getOraInizio() == null || request.getOraFine() == null) {
            throw new RuntimeException("Orari obbligatori per i turni");
        }

        LocalDateTime inizio = LocalDateTime.of(request.getDataInizio(), request.getOraInizio());
        LocalDateTime fine   = LocalDateTime.of(request.getDataFine(),   request.getOraFine());

        if (!fine.isAfter(inizio)) {
            throw new RuntimeException("L'orario di fine deve essere successivo all'orario di inizio");
        }
    }

    private void controllaSovrapposizione(TurnoRequest request, Long excludeId) {
        LocalDateTime inizio = LocalDateTime.of(request.getDataInizio(), request.getOraInizio());
        LocalDateTime fine   = LocalDateTime.of(request.getDataFine(),   request.getOraFine());

        boolean sovrapposto = turnoRepository.existsSovrapposizione(
                request.getDipendenteId(),
                inizio,
                fine,
                excludeId
        );

        if (sovrapposto) {
            throw new SovrapposizioneTurnoException("Il dipendente ha già un turno in questo intervallo di orario");
        }
    }
}