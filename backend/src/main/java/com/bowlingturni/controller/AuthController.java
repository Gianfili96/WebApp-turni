package com.bowlingturni.controller;

import com.bowlingturni.dto.CambioPasswordRequest;
import com.bowlingturni.dto.LoginRequest;
import com.bowlingturni.dto.LoginResponse;
import com.bowlingturni.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/cambio-password")
    public ResponseEntity<Void> cambiaPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CambioPasswordRequest request) {
        authService.cambiaPassword(userDetails.getUsername(), request);
        return ResponseEntity.ok().build();
    }

    // Endpoint pubblico per il primo accesso (senza JWT)
    @PostMapping("/cambio-password-primo-accesso")
    public ResponseEntity<Void> cambiaPasswordPrimoAccesso(
            @Valid @RequestBody CambioPasswordRequest request) {
        authService.cambiaPassword(request.getEmail(), request);
        return ResponseEntity.ok().build();
    }
}