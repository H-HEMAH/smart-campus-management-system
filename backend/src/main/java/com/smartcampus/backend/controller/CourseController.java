package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.entity.Course;
import com.smartcampus.backend.service.CourseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/course")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // SAVE
    @PostMapping
    public Course saveCourse(
            @Valid @RequestBody Course course) {

        return courseService.saveCourse(course);
    }

    // GET ALL
    @GetMapping
    public List<Course> getAllCourses() {

        return courseService.getAllCourses();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Course getCourseById(
            @PathVariable Long id) {

        return courseService.getCourseById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Course updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody Course course) {

        return courseService.updateCourse(id, course);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteCourse(
            @PathVariable Long id) {

        return courseService.deleteCourse(id);
    }
}