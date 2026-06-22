package com.bowlingturni.repository;

import com.bowlingturni.entity.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    // Turni di un dipendente in un intervallo di date (vista settimanale)
    List<Turno> findByDipendenteIdAndDataInizioBetweenOrderByDataInizioAscOraInizioAsc(
            Long dipendenteId,
            LocalDate dataInizioFrom,
            LocalDate dataInizioTo
    );

    // Tutti i turni della settimana (vista responsabile)
    List<Turno> findByDataInizioBetweenOrderByDataInizioAscOraInizioAsc(
            LocalDate dataInizioFrom,
            LocalDate dataInizioTo
    );

    // Controllo sovrapposizioni:
    // Verifica se esiste un turno del dipendente che si sovrappone
    // all'intervallo [nuovoInizio, nuovaFine].
    // Esclude il turno corrente in caso di modifica (excludeId).
    @Query("""
        SELECT COUNT(t) > 0 FROM Turno t
        WHERE t.dipendente.id = :dipendenteId
          AND t.id <> :excludeId
          AND FUNCTION('TIMESTAMP', t.dataInizio, t.oraInizio) < :nuovaFine
          AND FUNCTION('TIMESTAMP', t.dataFine,   t.oraFine)   > :nuovoInizio
    """)
    boolean existsSovrapposizione(
            @Param("dipendenteId") Long dipendenteId,
            @Param("nuovoInizio")  LocalDateTime nuovoInizio,
            @Param("nuovaFine")    LocalDateTime nuovaFine,
            @Param("excludeId")    Long excludeId
    );
}