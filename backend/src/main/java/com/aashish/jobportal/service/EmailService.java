package com.aashish.jobportal.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    // FIX 1: Inject the sender address so every outgoing message has a From header.
    // Gmail (and most SMTP servers) reject or silently drop messages with no From address.
    @Value("${spring.mail.username}")
    private String fromAddress;

    // FIX 2: Fail-fast at startup if critical mail config is missing.
    // Without this the app starts fine, emails fire into the void, and logs
    // show nothing because the @Async exception is swallowed before it reaches
    // any monitoring surface.
    @PostConstruct
    public void validateMailConfig() {
        log.info("=== Mail Configuration Check ===");
        log.info("SMTP host  : {}", System.getenv("SPRING_MAIL_HOST"));
        log.info("SMTP port  : {}", System.getenv("SPRING_MAIL_PORT"));
        log.info("SMTP user  : {}", System.getenv("SPRING_MAIL_USERNAME"));
        log.info("SMTP auth  : {}", System.getenv("SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH"));
        log.info("STARTTLS   : {}", System.getenv("SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE"));
        // Password intentionally omitted from logs

        String[] required = {
                "SPRING_MAIL_HOST",
                "SPRING_MAIL_PORT",
                "SPRING_MAIL_USERNAME",
                "SPRING_MAIL_PASSWORD",
                "SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH",
                "SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE"
        };
        for (String var : required) {
            String value = System.getenv(var);
            if (value == null || value.isBlank()) {
                // FIX 3: Throw at startup instead of failing silently at send time.
                throw new IllegalStateException(
                        "Required environment variable '" + var + "' is missing or blank. " +
                                "Email delivery will not work until this is set in the Render dashboard."
                );
            }
        }
        log.info("Mail configuration OK — JavaMailSender bean is wired to {}", fromAddress);
    }

    @Async
    public void sendApplicationConfirmation(String toEmail,
                                            String seekerName,
                                            String jobTitle) {
        log.info("[EMAIL] Sending application confirmation → to={} subject=\"Application Submitted — {}\"",
                toEmail, jobTitle);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);   // FIX 1 applied
            message.setTo(toEmail);
            message.setSubject("Application Submitted — " + jobTitle);
            message.setText(
                    "Hi " + seekerName + ",\n\n" +
                            "Your application for \"" + jobTitle + "\" has been submitted successfully.\n\n" +
                            "We will notify you when the recruiter reviews your application.\n\n" +
                            "Best regards,\nHireAI Team"
            );
            mailSender.send(message);
            log.info("[EMAIL] Application confirmation sent successfully → to={}", toEmail);
        } catch (MailException e) {
            // FIX 4: Log the full stack trace, not just the message.
            // MailException wraps MessagingException which wraps the SMTP dialog.
            // Without the stack trace you only see "Could not connect to SMTP" with
            // no clue whether it's auth failure, port blocked, or TLS mismatch.
            log.error("[EMAIL] SMTP failure sending confirmation → to={} subject=\"Application Submitted — {}\" | error={}",
                    toEmail, jobTitle, e.getMessage(), e);
        } catch (Exception e) {
            log.error("[EMAIL] Unexpected failure sending confirmation → to={} | error={}",
                    toEmail, e.getMessage(), e);
        }
    }

    @Async
    public void sendStatusUpdate(String toEmail,
                                 String seekerName,
                                 String jobTitle,
                                 String newStatus) {
        log.info("[EMAIL] Sending status update → to={} subject=\"Application Update — {}\" status={}",
                toEmail, jobTitle, newStatus);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);   // FIX 1 applied
            message.setTo(toEmail);
            message.setSubject("Application Update — " + jobTitle);
            message.setText(
                    "Hi " + seekerName + ",\n\n" +
                            "Your application for \"" + jobTitle + "\" has been updated.\n\n" +
                            "New Status: " + newStatus + "\n\n" +
                            "Best regards,\nHireAI Team"
            );
            mailSender.send(message);
            log.info("[EMAIL] Status update sent successfully → to={} status={}", toEmail, newStatus);
        } catch (MailException e) {
            log.error("[EMAIL] SMTP failure sending status update → to={} subject=\"Application Update — {}\" status={} | error={}",
                    toEmail, jobTitle, newStatus, e.getMessage(), e);
        } catch (Exception e) {
            log.error("[EMAIL] Unexpected failure sending status update → to={} | error={}",
                    toEmail, e.getMessage(), e);
        }
    }
}