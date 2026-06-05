package com.aashish.jobportal.controller;

import com.aashish.jobportal.dto.ApiResponse;
import com.aashish.jobportal.entity.Resume;
import com.aashish.jobportal.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<ApiResponse<Resume>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        Resume resume = resumeService.uploadResume(file, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded", resume));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<ApiResponse<Resume>> getMyResume(
            @AuthenticationPrincipal UserDetails userDetails) {

        Resume resume = resumeService.getMyResume(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resume fetched", resume));
    }
}