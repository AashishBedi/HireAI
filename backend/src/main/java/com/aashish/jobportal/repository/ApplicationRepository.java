package com.aashish.jobportal.repository;

import com.aashish.jobportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findBySeekerId(Long seekerId);
    List<Application> findByJobIdOrderByMatchScoreDesc(Long jobId);
    Optional<Application> findByJobIdAndSeekerId(Long jobId, Long seekerId);
    boolean existsByJobIdAndSeekerId(Long jobId, Long seekerId);
}