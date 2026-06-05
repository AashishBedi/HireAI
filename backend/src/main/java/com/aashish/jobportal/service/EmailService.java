package com.aashish.jobportal.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendApplicationConfirmation(String toEmail,
                                            String seekerName,
                                            String jobTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Application Submitted — " + jobTitle);
        message.setText(
                "Hi " + seekerName + ",\n\n" +
                        "Your application for \"" + jobTitle + "\" has been submitted successfully.\n\n" +
                        "We will notify you when the recruiter reviews your application.\n\n" +
                        "Best regards,\nJobPortal Team"
        );
        mailSender.send(message);
    }

    @Async
    public void sendStatusUpdate(String toEmail,
                                 String seekerName,
                                 String jobTitle,
                                 String newStatus) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Application Update — " + jobTitle);
        message.setText(
                "Hi " + seekerName + ",\n\n" +
                        "Your application for \"" + jobTitle + "\" has been updated.\n\n" +
                        "New Status: " + newStatus + "\n\n" +
                        "Best regards,\nJobPortal Team"
        );
        mailSender.send(message);
    }
}