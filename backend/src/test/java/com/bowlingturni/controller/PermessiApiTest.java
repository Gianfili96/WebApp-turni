package com.bowlingturni.controller;

import com.bowlingturni.IntegrationTest;
import com.bowlingturni.entity.Dipendente;
import com.bowlingturni.entity.User;
import com.bowlingturni.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Verifica chi può chiamare cosa e con quale status HTTP risponde l'API
class PermessiApiTest extends IntegrationTest {

    private static final String SETTIMANA = "?dal=2026-01-12&al=2026-01-18";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    private Dipendente addetto;
    private Dipendente collega;
    private String tokenAddetto;
    private String tokenResponsabile;

    @BeforeEach
    void setUp() {
        addetto = creaAddetto("addetto@test.it");
        collega = creaAddetto("collega@test.it");
        creaUtente("responsabile@test.it", User.Ruolo.RESPONSABILE);

        tokenAddetto      = "Bearer " + jwtUtil.generateToken("addetto@test.it", "ADDETTO");
        tokenResponsabile = "Bearer " + jwtUtil.generateToken("responsabile@test.it", "RESPONSABILE");
    }

    // ---- Addetto: solo i propri dati ----

    @Test
    void addettoVedeIPropriTurni() throws Exception {
        mockMvc.perform(get("/api/turni/dipendente/" + addetto.getId() + SETTIMANA)
                        .header("Authorization", tokenAddetto))
                .andExpect(status().isOk());
    }

    @Test
    void addettoNonVedeITurniDiUnCollega() throws Exception {
        mockMvc.perform(get("/api/turni/dipendente/" + collega.getId() + SETTIMANA)
                        .header("Authorization", tokenAddetto))
                .andExpect(status().isForbidden());
    }

    @Test
    void addettoVedeIlProprioProfilo() throws Exception {
        mockMvc.perform(get("/api/dipendenti/" + addetto.getId())
                        .header("Authorization", tokenAddetto))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("addetto@test.it"));
    }

    @Test
    void addettoNonVedeIlProfiloDiUnCollega() throws Exception {
        mockMvc.perform(get("/api/dipendenti/" + collega.getId())
                        .header("Authorization", tokenAddetto))
                .andExpect(status().isForbidden());
    }

    @Test
    void addettoNonVedeLaListaDipendenti() throws Exception {
        mockMvc.perform(get("/api/dipendenti").header("Authorization", tokenAddetto))
                .andExpect(status().isForbidden());
    }

    // ---- Responsabile ----

    @Test
    void responsabileVedeIlProfiloDiQualsiasiDipendente() throws Exception {
        mockMvc.perform(get("/api/dipendenti/" + collega.getId())
                        .header("Authorization", tokenResponsabile))
                .andExpect(status().isOk());
    }

    @Test
    void dipendenteInesistenteRisponde404() throws Exception {
        mockMvc.perform(get("/api/dipendenti/999999").header("Authorization", tokenResponsabile))
                .andExpect(status().isNotFound());
    }

    // ---- Autenticazione ----

    @Test
    void richiestaSenzaTokenRisponde401() throws Exception {
        mockMvc.perform(get("/api/turni" + SETTIMANA))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenNonValidoRisponde401() throws Exception {
        mockMvc.perform(get("/api/turni" + SETTIMANA).header("Authorization", "Bearer token-falso"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenDiUnUtenteEliminatoRisponde401() throws Exception {
        String token = "Bearer " + jwtUtil.generateToken("eliminato@test.it", "ADDETTO");

        mockMvc.perform(get("/api/turni" + SETTIMANA).header("Authorization", token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginConPasswordSbagliataRisponde401() throws Exception {
        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"addetto@test.it\",\"password\":\"sbagliata\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginCorrettoRestituisceIlToken() throws Exception {
        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"addetto@test.it\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.dipendenteId").value(addetto.getId()));
    }
}
