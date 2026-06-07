package com.aashish.jobportal.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Async
    public void sendApplicationConfirmation(String toEmail,
                                            String seekerName,
                                            String jobTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Application Submitted — " + jobTitle);
            message.setText(
                    "Hi " + seekerName + ",\n\n" +
                            "Your application for \"" + jobTitle + "\" has been submitted successfully.\n\n" +
                            "We will notify you when the recruiter reviews your application.\n\n" +
                            "Best regards,\nHireAI Team"
            );
            mailSender.send(message);
            log.info("Confirmation email sent to {}", toEmail);
        } catch (Exception e) {
            // Logged here on the async thread where the exception actually lives.
            // The try/catch in ApplicationService cannot catch this — @Async runs
            // on a separate thread after the caller has already returned.
            log.error("Failed to send confirmation email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Async
    public void sendStatusUpdate(String toEmail,
                                 String seekerName,
                                 String jobTitle,
                                 String newStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Application Update — " + jobTitle);
            message.setText(
                    "Hi " + seekerName + ",\n\n" +
                            "Your application for \"" + jobTitle + "\" has been updated.\n\n" +
                            "New Status: " + newStatus + "\n\n" +
                            "Best regards,\nHireAI Team"
            );
            mailSender.send(message);
            log.info("Status update email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send status update email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
