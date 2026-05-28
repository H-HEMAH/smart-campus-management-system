package com.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.backend.entity.Course;

public interface CourseRepository
        extends JpaRepository<Course, Long> {

}