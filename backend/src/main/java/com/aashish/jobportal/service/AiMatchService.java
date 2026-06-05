package com.aashish.jobportal.service;

import com.aashish.jobportal.dto.MatchRequest;
import com.aashish.jobportal.dto.MatchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class AiMatchService {

    private final WebClient webClient;

    public MatchResponse getMatchScore(String resumeText, String jobDescription) {
        return webClient.post()
                .uri("/match-jd")
                .bodyValue(new MatchRequest(resumeText, jobDescription))
                .retrieve()
                .bodyToMono(MatchResponse.class)
                .block();
    }
}