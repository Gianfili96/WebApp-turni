package com.bowlingturni.service;

import com.bowlingturni.dto.CambioPasswordRequest;
import com.bowlingturni.dto.LoginRequest;
import com.bowlingturni.dto.LoginResponse;
import com.bowlingturni.entity.User;
import com.bowlingturni.repository.UserRepository;
import com.bowlingturni.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil         jwtUtil;

    public LoginResponse login(LoginRequest request) {
        // 1. Cerca l'utente per email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenziali non valide"));

        // 2. Verifica la password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Credenziali non valide");
        }

        Long dipendenteId = user.getDipendente() != null ? user.getDipendente().getId() : null;

        // 3. Genera il token JWT
        String token = jwtUtil.generateToken(user.getEmail(), user.getRuolo().name());

        // 4. Restituisce la risposta con token e dati utente
        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .dipendenteId(dipendenteId)
                .nome(user.getNome())
                .email(user.getEmail())
                .ruolo(user.getRuolo())
                .build();
    }

    // Cambio password — usato sia per primo accesso che per cambio successivo
    @Transactional
    public void cambiaPassword(String email, CambioPasswordRequest request) {
        // Verifica che nuova password e conferma coincidano
        if (!request.getNuovaPassword().equals(request.getConfermaPassword())) {
            throw new RuntimeException("Le password non coincidono");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        // Verifica password attuale
        if (!passwordEncoder.matches(request.getPasswordAttuale(), user.getPasswordHash())) {
            throw new RuntimeException("Password attuale non corretta");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNuovaPassword()));
        userRepository.save(user);
    }
}