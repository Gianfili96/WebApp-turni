package com.bowlingturni.service;

import com.bowlingturni.dto.DipendenteResponse;
import com.bowlingturni.dto.RegistrazioneDipendenteRequest;
import com.bowlingturni.entity.Dipendente;
import com.bowlingturni.entity.User;
import com.bowlingturni.repository.DipendenteRepository;
import com.bowlingturni.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DipendenteService {

    private final DipendenteRepository dipendenteRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;  // ← aggiungi

    // Restituisce tutti i dipendenti attivi
    public List<DipendenteResponse> getTuttiAttivi() {
        return dipendenteRepository.findByAttivoTrue()
                .stream()
                .map(DipendenteResponse::fromEntity)
                .toList();
    }

    // Restituisce un dipendente per ID
    public DipendenteResponse getById(Long id) {
        return dipendenteRepository.findById(id)
                .map(DipendenteResponse::fromEntity)
                .orElseThrow(() -> new RuntimeException("Dipendente non trovato con id: " + id));
    }

    // Registra un nuovo dipendente
    @Transactional
    public DipendenteResponse registraDipendente(RegistrazioneDipendenteRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email già registrata: " + request.getEmail());
        }

        User user = User.builder()
                .nome(request.getNome() + " " + request.getCognome())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .ruolo(User.Ruolo.ADDETTO)
                .build();
        userRepository.save(user);

        Dipendente dipendente = Dipendente.builder()
                .user(user)
                .nome(request.getNome())
                .cognome(request.getCognome())
                .telefono(request.getTelefono())
                .reparto(request.getReparto())
                .attivo(true)
                .build();
        dipendenteRepository.save(dipendente);

        // Invia email di benvenuto con credenziali
        emailService.inviaEmailBenvenuto(
                request.getEmail(),
                request.getNome(),
                request.getCognome(),
                request.getPassword()
        );

        return DipendenteResponse.fromEntity(dipendente);
    }

    // Modifica dipendente
    @Transactional
    public DipendenteResponse modificaDipendente(Long id, RegistrazioneDipendenteRequest request) {
        Dipendente dipendente = dipendenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dipendente non trovato con id: " + id));

        dipendente.setNome(request.getNome());
        dipendente.setCognome(request.getCognome());
        dipendente.setTelefono(request.getTelefono());
        dipendente.setReparto(request.getReparto());

        User user = dipendente.getUser();
        user.setNome(request.getNome() + " " + request.getCognome());

        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email già registrata: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);
        dipendenteRepository.save(dipendente);

        return DipendenteResponse.fromEntity(dipendente);
    }

    // Elimina dipendente
    @Transactional
    public void eliminaDipendente(Long id) {
        Dipendente dipendente = dipendenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dipendente non trovato con id: " + id));

        User user = dipendente.getUser();
        dipendenteRepository.delete(dipendente);
        userRepository.delete(user);  // ← aggiungi questa riga
    }
}