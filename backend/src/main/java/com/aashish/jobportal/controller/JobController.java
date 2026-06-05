package com.aashish.jobportal.controller;

import com.aashish.jobportal.dto.ApiResponse;
import com.aashish.jobportal.entity.Job;
import com.aashish.jobportal.entity.User;
import com.aashish.jobportal.enums.JobStatus;
import com.aashish.jobportal.repository.CompanyRepository;
import com.aashish.jobportal.repository.UserRepository;
import com.aashish.jobportal.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Job>>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Jobs fetched", jobService.getAllJobs(page, size)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Job>>> searchJobs(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Search results",
                        jobService.searchJobs(skill, location, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Job>> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Job fetched", jobService.getJobById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<Job>> createJob(
            @RequestBody Job job,
            @AuthenticationPrincipal UserDetails userDetails) {

        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        companyRepository.findByRecruiterId(recruiter.getId())
                .ifPresent(job::setCompany);

        job.setPostedBy(recruiter);
        job.setStatus(JobStatus.OPEN);

        return ResponseEntity.ok(
                ApiResponse.success("Job created", jobService.createJob(job)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<Job>> updateStatus(
            @PathVariable Long id,
            @RequestParam JobStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success("Status updated",
                        jobService.updateJobStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job deleted", null));
    }
}