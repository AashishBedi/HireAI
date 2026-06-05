package com.aashish.jobportal.dto;

import lombok.Data;
import java.util.List;

@Data
public class MatchResponse {
    private Double matchScore;
    private List<String> missingSkills;
}