package com.bowlingturni.service;

import com.bowlingturni.IntegrationTest;
import com.bowlingturni.dto.TurnoRequest;
import com.bowlingturni.dto.TurnoResponse;
import com.bowlingturni.entity.Dipendente;
import com.bowlingturni.entity.Turno;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TurnoServiceTest extends IntegrationTest {

    private static final LocalDate GIORNO = LocalDate.of(2026, 1, 12);

    @Autowired
    private TurnoService turnoService;

    private Dipendente mario;
    private Dipendente luca;

    @BeforeEach
    void setUp() {
        mario = creaAddetto("mario@test.it");
        luca  = creaAddetto("luca@test.it");
    }

    // ---- Sovrapposizione ----

    @Test
    void turnoCheSiAccavallaVieneSegnalato() {
        crea(mario, GIORNO, "10:00", GIORNO, "14:00");

        TurnoResponse nuovo = crea(mario, GIORNO, "12:00", GIORNO, "16:00");

        assertThat(nuovo.getSovrapposizione()).isTrue();
    }

    @Test
    void turnoCheIniziaQuandoFinisceIlPrecedenteNonESovrapposto() {
        crea(mario, GIORNO, "10:00", GIORNO, "14:00");

        TurnoResponse nuovo = crea(mario, GIORNO, "14:00", GIORNO, "18:00");

        assertThat(nuovo.getSovrapposizione()).isFalse();
    }

    @Test
    void stessoOrarioPerUnAltroDipendenteNonESovrapposto() {
        crea(mario, GIORNO, "10:00", GIORNO, "14:00");

        TurnoResponse nuovo = crea(luca, GIORNO, "10:00", GIORNO, "14:00");

        assertThat(nuovo.getSovrapposizione()).isFalse();
    }

    @Test
    void sovrapposizioneACavalloDellaMezzanotte() {
        crea(mario, GIORNO, "22:00", GIORNO.plusDays(1), "02:00");

        TurnoResponse nuovo = crea(mario, GIORNO.plusDays(1), "01:00", GIORNO.plusDays(1), "03:00");

        assertThat(nuovo.getSovrapposizione()).isTrue();
    }

    @Test
    void modificareUnTurnoNonLoConfrontaConSeStesso() {
        TurnoResponse turno = crea(mario, GIORNO, "10:00", GIORNO, "14:00");

        TurnoResponse modificato = turnoService.modificaTurno(turno.getId(),
                request(mario, GIORNO, "11:00", GIORNO, "15:00", Turno.TipoTurno.TURNO));

        assertThat(modificato.getSovrapposizione()).isFalse();
    }

    @Test
    void ferieNonVengonoControllatePerLaSovrapposizione() {
        crea(mario, GIORNO, "10:00", GIORNO, "14:00");

        TurnoResponse ferie = turnoService.creaTurno(
                request(mario, GIORNO, null, GIORNO, null, Turno.TipoTurno.FERIE));

        assertThat(ferie.getSovrapposizione()).isFalse();
    }

    // ---- Validazione orari ----

    @Test
    void turnoSenzaOrariVieneRifiutato() {
        assertThatThrownBy(() -> turnoService.creaTurno(
                request(mario, GIORNO, null, GIORNO, null, Turno.TipoTurno.TURNO)))
                .hasMessage("Orari obbligatori per i turni");
    }

    @Test
    void turnoConFinePrimaDellInizioVieneRifiutato() {
        assertThatThrownBy(() -> crea(mario, GIORNO, "14:00", GIORNO, "10:00"))
                .hasMessage("L'orario di fine deve essere successivo all'orario di inizio");
    }

    // ---- Helper ----

    private TurnoResponse crea(Dipendente d, LocalDate dataInizio, String oraInizio,
                               LocalDate dataFine, String oraFine) {
        return turnoService.creaTurno(request(d, dataInizio, oraInizio, dataFine, oraFine, Turno.TipoTurno.TURNO));
    }

    private TurnoRequest request(Dipendente d, LocalDate dataInizio, String oraInizio,
                                 LocalDate dataFine, String oraFine, Turno.TipoTurno tipo) {
        TurnoRequest r = new TurnoRequest();
        r.setDipendenteId(d.getId());
        r.setDataInizio(dataInizio);
        r.setOraInizio(oraInizio != null ? LocalTime.parse(oraInizio) : null);
        r.setDataFine(dataFine);
        r.setOraFine(oraFine != null ? LocalTime.parse(oraFine) : null);
        r.setTipo(tipo);
        return r;
    }
}
