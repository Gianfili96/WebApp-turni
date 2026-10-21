package com.bowlingturni;

import com.bowlingturni.entity.Dipendente;
import com.bowlingturni.entity.Reparto;
import com.bowlingturni.entity.User;
import com.bowlingturni.repository.DipendenteRepository;
import com.bowlingturni.repository.UserRepository;
import com.bowlingturni.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

// Base dei test di integrazione: database bowling_turni_test, ogni test viene annullato (rollback) alla fine
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class IntegrationTest {

    protected static final String PASSWORD = "password123";

    // Nessuna email reale durante i test
    @MockitoBean
    protected EmailService emailService;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected DipendenteRepository dipendenteRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    protected User creaUtente(String email, User.Ruolo ruolo) {
        return userRepository.save(User.builder()
                .nome("Test " + email)
                .email(email)
                .passwordHash(passwordEncoder.encode(PASSWORD))
                .ruolo(ruolo)
                .build());
    }

    protected Dipendente creaAddetto(String email) {
        User user = creaUtente(email, User.Ruolo.ADDETTO);
        Dipendente dipendente = dipendenteRepository.save(Dipendente.builder()
                .user(user)
                .nome("Nome")
                .cognome("Cognome")
                .reparto(Reparto.CASSA)
                .attivo(true)
                .build());
        // Collega anche il lato User: nella stessa transazione Hibernate restituisce l'oggetto in memoria
        user.setDipendente(dipendente);
        return dipendente;
    }
}
