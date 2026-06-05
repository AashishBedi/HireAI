package com.aashish.jobportal.repository;

import com.aashish.jobportal.entity.Job;
import com.aashish.jobportal.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE " +
            "(:skill IS NULL OR :skill MEMBER OF j.requiredSkills) AND " +
            "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "j.status = 'OPEN'")
    Page<Job> searchJobs(@Param("skill") String skill,
                         @Param("location") String location,
                         Pageable pageable);
}