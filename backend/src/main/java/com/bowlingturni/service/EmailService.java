package com.bowlingturni.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${sendgrid.api.key}")
    private String apiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    @Value("${sendgrid.from.name}")
    private String fromName;

    @Value("${app.url}")
    private String appUrl;

    public void inviaEmailBenvenuto(String toEmail, String nome, String cognome, String passwordTemporanea) {
        log.info("Invio email a: {}", toEmail);
        log.info("API Key presente: {}", apiKey != null && !apiKey.isEmpty());
        log.info("From email: {}", fromEmail);

        Email from = new Email(fromEmail, fromName);
        Email to = new Email(toEmail);
        String subject = "Benvenuto in Bowling Turni - Le tue credenziali di accesso";

        String htmlContent = buildEmailBenvenuto(nome, cognome, toEmail, passwordTemporanea, appUrl);
        Content content = new Content("text/html", htmlContent);

        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            log.info("SendGrid response status: {}", response.getStatusCode());
            log.info("SendGrid response body: {}", response.getBody());
        } catch (IOException e) {
            log.error("Errore invio email: {}", e.getMessage());
            throw new RuntimeException("Errore nell'invio dell'email: " + e.getMessage());
        }
    }

    private String buildEmailBenvenuto(String nome, String cognome, String email, String password, String appUrl) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
                        .header { background: #3f51b5; padding: 32px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 24px; }
                        .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
                        .body { padding: 32px; }
                        .body h2 { color: #1a237e; margin-top: 0; }
                        .body p { color: #555; line-height: 1.6; }
                        .credenziali { background: #e8eaf6; border-radius: 8px; padding: 20px; margin: 24px 0; }
                        .credenziali p { margin: 8px 0; color: #333; }
                        .credenziali strong { color: #1a237e; }
                        .btn { display: inline-block; background: #3f51b5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
                        .footer { background: #f5f5f5; padding: 16px 32px; text-align: center; }
                        .footer p { color: #999; font-size: 12px; margin: 0; }
                        .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 12px 16px; border-radius: 4px; margin-top: 16px; }
                        .warning p { color: #e65100; margin: 0; font-size: 13px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎳 Bowling Turni</h1>
                            <p>Sistema di Gestione Turni</p>
                        </div>
                        <div class="body">
                            <h2>Benvenuto, %s %s!</h2>
                            <p>Il tuo account è stato creato con successo. Di seguito trovi le tue credenziali per accedere al sistema.</p>
                            <div class="credenziali">
                                <p>📧 <strong>Email:</strong> %s</p>
                                <p>🔑 <strong>Password temporanea:</strong> %s</p>
                            </div>
                            <div class="warning">
                                <p>⚠️ Per motivi di sicurezza ti consigliamo di cambiare la password al primo accesso.</p>
                            </div>
                            <p>Clicca il bottone qui sotto per impostare la tua nuova password:</p>
                            <div class="btn-container">
                                <a href="%s/cambio-password" class="btn">🔐 Cambia Password</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Questa email è stata inviata automaticamente dal sistema Bowling Turni. Non rispondere a questa email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(nome, cognome, email, password, appUrl);
    }

    public void inviaNotificaTurni(String toEmail, String nomeDipendente,
                                   List<com.bowlingturni.entity.Turno> turni,
                                   String dal, String al) {
        log.info("Invio notifica turni a: {}", toEmail);

        Email from = new Email(fromEmail, fromName);
        Email to = new Email(toEmail);
        String subject = "📅 I tuoi turni sono stati aggiornati - Bowling Turni";

        String htmlContent = buildEmailNotificaTurni(nomeDipendente, turni, dal, al);
        Content content = new Content("text/html", htmlContent);

        Mail mail = new Mail(from, subject, to, content);
        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            log.info("SendGrid response status: {}", response.getStatusCode());
        } catch (IOException e) {
            log.error("Errore invio notifica turni: {}", e.getMessage());
        }
    }

    private String buildEmailNotificaTurni(String nomeDipendente,
                                           List<com.bowlingturni.entity.Turno> turni,
                                           String dal, String al) {
        StringBuilder righe = new StringBuilder();
        for (com.bowlingturni.entity.Turno turno : turni) {
            String orario = turno.getOraInizio() != null
                    ? turno.getOraInizio() + " - " + turno.getOraFine()
                    : turno.getTipo().name();
            righe.append(String.format("""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">%s</td>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">%s</td>
                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">%s</td>
            </tr>
        """, turno.getDataInizio(), turno.getTipo().name(), orario));
        }

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
                    .header { background: #3f51b5; padding: 32px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 24px; }
                    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
                    .body { padding: 32px; }
                    .body h2 { color: #1a237e; margin-top: 0; }
                    .body p { color: #555; line-height: 1.6; }
                    table { width: 100%%; border-collapse: collapse; margin-top: 16px; }
                    th { background: #3f51b5; color: white; padding: 10px; text-align: left; }
                    .footer { background: #f5f5f5; padding: 16px 32px; text-align: center; }
                    .footer p { color: #999; font-size: 12px; margin: 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎳 Bowling Turni</h1>
                        <p>Aggiornamento Turni</p>
                    </div>
                    <div class="body">
                        <h2>Ciao %s!</h2>
                        <p>I tuoi turni per la settimana dal <strong>%s</strong> al <strong>%s</strong> sono stati aggiornati.</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Tipo</th>
                                    <th>Orario</th>
                                </tr>
                            </thead>
                            <tbody>
                                %s
                            </tbody>
                        </table>
                        <p style="margin-top: 24px;">Accedi all'app per vedere tutti i dettagli.</p>
                    </div>
                    <div class="footer">
                        <p>Questa email è stata inviata automaticamente dal sistema Bowling Turni. Non rispondere a questa email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(nomeDipendente, dal, al, righe.toString());
    }
}

