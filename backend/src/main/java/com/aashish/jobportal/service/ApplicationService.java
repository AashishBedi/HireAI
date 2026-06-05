package com.aashish.jobportal.service;

import com.aashish.jobportal.dto.*;
import com.aashish.jobportal.entity.*;
import com.aashish.jobportal.enums.ApplicationStatus;
import com.aashish.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final AiMatchService aiMatchService;
    private final EmailService emailService;

    public ApplicationResponse apply(Long jobId, String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applicationRepository.existsByJobIdAndSeekerId(jobId, seeker.getId())) {
            throw new RuntimeException("Already applied to this job");
        }

        // Get resume text if available
        String resumeText = resumeRepository.findByUserId(seeker.getId())
                .map(Resume::getParsedText)
                .orElse("");

        // Get AI match score
        Double matchScore = 0.0;
        List<String> missingSkills = List.of();

        if (resumeText != null && !resumeText.isEmpty()) {
            try {
                MatchResponse match = aiMatchService.getMatchScore(
                        resumeText, job.getDescription());
                matchScore = match.getMatchScore();
                missingSkills = match.getMissingSkills();
            } catch (Exception e) {
                matchScore = null;
            }
        }

        Application application = Application.builder()
                .job(job)
                .seeker(seeker)
                .status(ApplicationStatus.APPLIED)
                .matchScore(matchScore)
                .missingSkills(missingSkills)
                .build();

        applicationRepository.save(application);

        // Send confirmation email
        try {
            emailService.sendApplicationConfirmation(
                    seeker.getEmail(),
                    seeker.getName(),
                    job.getTitle());
        } catch (Exception e) {
            // Email failure should not break the application flow
        }

        return toResponse(application);
    }

    public List<ApplicationResponse> getMyApplications(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepository.findBySeekerId(seeker.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobIdOrderByMatchScoreDesc(jobId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ApplicationResponse updateStatus(Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(status);
        applicationRepository.save(application);

        // Send status update email
        try {
            emailService.sendStatusUpdate(
                    application.getSeeker().getEmail(),
                    application.getSeeker().getName(),
                    application.getJob().getTitle(),
                    status.name());
        } catch (Exception e) {
            // Email failure should not break the flow
        }

        return toResponse(application);
    }

    private ApplicationResponse toResponse(Application app) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(app.getId());
        response.setJobId(app.getJob().getId());
        response.setJobTitle(app.getJob().getTitle());
        response.setCompanyName(
                app.getJob().getCompany() != null
                        ? app.getJob().getCompany().getName()
                        : "N/A");
        response.setStatus(app.getStatus());
        response.setMatchScore(app.getMatchScore());
        response.setMissingSkills(app.getMissingSkills());
        response.setAppliedAt(app.getAppliedAt());
        response.setSeekerName(app.getSeeker().getName());
        response.setSeekerEmail(app.getSeeker().getEmail());
        return response;
    }
}