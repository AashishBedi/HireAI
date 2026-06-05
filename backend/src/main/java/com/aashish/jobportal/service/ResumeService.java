package com.aashish.jobportal.service;

import com.aashish.jobportal.entity.Resume;
import com.aashish.jobportal.entity.User;
import com.aashish.jobportal.repository.ResumeRepository;
import com.aashish.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;

    public Resume uploadResume(MultipartFile file, String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Send PDF to FastAPI for parsing
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);

        Map response = webClient.post()
                .uri("/parse-resume")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(body))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        String parsedText = (String) response.get("parsedText");
        List<String> extractedSkills = (List<String>) response.get("extractedSkills");

        // Save or update resume
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElse(Resume.builder().user(user).build());

        resume.setParsedText(parsedText);
        resume.setExtractedSkills(extractedSkills);
        resume.setFileUrl("local/" + file.getOriginalFilename());

        return resumeRepository.save(resume);
    }

    public Resume getMyResume(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return resumeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No resume found"));
    }
}