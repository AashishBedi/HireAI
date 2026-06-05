package com.aashish.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MatchRequest {
    private String resumeText;
    private String jobDescription;
}