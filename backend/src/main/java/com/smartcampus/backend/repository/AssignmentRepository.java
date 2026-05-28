package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseId(Long courseId);
    List<Assignment> findAllByOrderByDeadlineAsc();
}
