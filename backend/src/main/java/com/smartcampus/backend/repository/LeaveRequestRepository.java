package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudentId(Long studentId);
    List<LeaveRequest> findByStudentEmail(String email);
    List<LeaveRequest> findByStatus(String status);
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();
}
