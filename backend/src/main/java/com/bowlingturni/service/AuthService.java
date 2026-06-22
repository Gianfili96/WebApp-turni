package com.bowlingturni.service;

import com.bowlingturni.dto.LoginRequest;
import com.bowlingturni.dto.LoginResponse;
import com.bowlingturni.entity.User;
import com.bowlingturni.repository.UserRepository;
import com.bowlingturni.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
}