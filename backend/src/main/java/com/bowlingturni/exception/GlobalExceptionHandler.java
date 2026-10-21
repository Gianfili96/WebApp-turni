package com.bowlingturni.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Errori di validazione (@NotNull, @NotBlank, ecc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errori = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> errori.put(err.getField(), err.getDefaultMessage()));

        return buildResponse(HttpStatus.BAD_REQUEST, "Errore di validazione", errori);
    }

    // Sovrapposizione turni
    @ExceptionHandler(SovrapposizioneTurnoException.class)
    public ResponseEntity<Map<String, Object>> handleSovrapposizione(
            SovrapposizioneTurnoException ex) {

        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    // Accesso negato da @PreAuthorize (altrimenti finirebbe nel gestore RuntimeException come 400)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Accesso negato", null);
    }

    // Login fallito
    @ExceptionHandler(CredenzialiNonValideException.class)
    public ResponseEntity<Map<String, Object>> handleCredenzialiNonValide(CredenzialiNonValideException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), null);
    }

    // Entità non trovata (dipendente, turno)
    @ExceptionHandler(RisorsaNonTrovataException.class)
    public ResponseEntity<Map<String, Object>> handleNonTrovata(RisorsaNonTrovataException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    // Errori generici di business (es. email già registrata, orari non validi)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    // Builder risposta errore standard
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status,
                                                              String messaggio,
                                                              Object dettagli) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("messaggio", messaggio);
        if (dettagli != null) {
            body.put("dettagli", dettagli);
        }
        return ResponseEntity.status(status).body(body);
    }
}