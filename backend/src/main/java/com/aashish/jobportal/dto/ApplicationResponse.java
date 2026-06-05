package com.aashish.jobportal.dto;

import com.aashish.jobportal.enums.ApplicationStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private ApplicationStatus status;
    private Double matchScore;
    private List<String> missingSkills;
    private LocalDateTime appliedAt;
    private String seekerName;
    private String seekerEmail;
}