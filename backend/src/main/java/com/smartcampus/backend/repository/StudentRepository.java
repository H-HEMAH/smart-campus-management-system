package com.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.backend.entity.Student;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmailIgnoreCase(String email);
}
