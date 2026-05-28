package com.smartcampus.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.entity.Course;
import com.smartcampus.backend.repository.CourseRepository;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    // SAVE
    public Course saveCourse(Course course) {

        return courseRepository.save(course);
    }

    // GET ALL
    public List<Course> getAllCourses() {

        return courseRepository.findAll();
    }

    // GET BY ID
    public Course getCourseById(Long id) {

        return courseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));
    }

    // UPDATE
    public Course updateCourse(Long id,
                               Course updatedCourse) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        course.setCourseName(updatedCourse.getCourseName());
        course.setTrainer(updatedCourse.getTrainer());
        course.setDuration(updatedCourse.getDuration());

        return courseRepository.save(course);
    }

    // DELETE
    public String deleteCourse(Long id) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        courseRepository.delete(course);

        return "Course deleted successfully";
    }
}