package com.aashish.jobportal.service;

import com.aashish.jobportal.entity.Job;
import com.aashish.jobportal.enums.JobStatus;
import com.aashish.jobportal.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public Page<Job> getAllJobs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return jobRepository.findByStatus(JobStatus.OPEN, pageable);
    }

    public Page<Job> searchJobs(String skill, String location,
                                int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return jobRepository.searchJobs(skill, location, pageable);
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    @CacheEvict(value = {"jobs", "jobs-search"}, allEntries = true)
    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    @CacheEvict(value = {"jobs", "jobs-search"}, allEntries = true)
    public Job updateJobStatus(Long id, JobStatus status) {
        Job job = getJobById(id);
        job.setStatus(status);
        return jobRepository.save(job);
    }

    @CacheEvict(value = {"jobs", "jobs-search"}, allEntries = true)
    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }
}