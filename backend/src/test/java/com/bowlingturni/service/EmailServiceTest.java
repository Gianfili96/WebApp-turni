package com.bowlingturni.service;

import com.bowlingturni.entity.Turno;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

// Contenuto dell'email di notifica turni (nessun invio reale)
class EmailServiceTest {

    private final EmailService emailService = new EmailService();

    @BeforeEach
    void setUp() {
        // In produzione arriva da app.url (variabile APP_URL); qui con "/" finale per verificare che venga gestito
        ReflectionTestUtils.setField(emailService, "appUrl", "https://turni.esempio.it/");
    }

    @Test
    void lEmailContieneIlLinkAlLoginDelGestionale() {
        String html = emailService.buildEmailNotificaTurni("Marco",
                List.of(turno(null)), "2026-10-19", "2026-10-25");

        assertThat(html)
                .contains("Accedi al gestionale turni per vedere tutti i dettagli.")
                .contains("href=\"https://turni.esempio.it/login\"")
                .doesNotContain("Accedi all'app");
    }

    @Test
    void laNotaDelTurnoCompareNellEmail() {
        String html = emailService.buildEmailNotificaTurni("Marco",
                List.of(turno("Chiusura sala alle 23")), "2026-10-19", "2026-10-25");

        assertThat(html).contains("Nota:").contains("Chiusura sala alle 23");
    }

    @Test
    void unTurnoSenzaNotaNonHaLaRigaDellaNota() {
        String html = emailService.buildEmailNotificaTurni("Marco",
                List.of(turno(null), turno("   ")), "2026-10-19", "2026-10-25");

        assertThat(html).doesNotContain("Nota:");
    }

    @Test
    void ilTestoDellaNotaVieneEscapato() {
        String html = emailService.buildEmailNotificaTurni("Marco",
                List.of(turno("<b>porta</b> \"chiavi\"\nseconda riga")), "2026-10-19", "2026-10-25");

        assertThat(html)
                .contains("&lt;b&gt;porta&lt;/b&gt; &quot;chiavi&quot;<br>seconda riga")
                .doesNotContain("<b>porta</b>");
    }

    @Test
    void dateTipiEOrariSonoInItaliano() {
        Turno ferie = Turno.builder()
                .dataInizio(LocalDate.of(2026, 10, 23))
                .dataFine(LocalDate.of(2026, 10, 23))
                .tipo(Turno.TipoTurno.FERIE)
                .build();

        String html = emailService.buildEmailNotificaTurni("Marco",
                List.of(turno(null), ferie), "2026-10-19", "2026-10-25");

        assertThat(html)
                .contains("dal <strong>19 ottobre</strong> al <strong>25 ottobre 2026</strong>")
                .contains("Mercoledì 21 ottobre")
                .contains("17:00 – 01:00")
                .contains(">Turno<")
                .contains("Venerdì 23 ottobre")
                .contains(">Ferie<")
                .doesNotContain("TURNO")
                .doesNotContain("FERIE")
                .doesNotContain("2026-10-21");
    }

    private Turno turno(String nota) {
        return Turno.builder()
                .dataInizio(LocalDate.of(2026, 10, 21))
                .oraInizio(LocalTime.of(17, 0))
                .dataFine(LocalDate.of(2026, 10, 22))
                .oraFine(LocalTime.of(1, 0))
                .tipo(Turno.TipoTurno.TURNO)
                .nota(nota)
                .build();
    }
}
