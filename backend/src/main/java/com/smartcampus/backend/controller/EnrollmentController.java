package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.entity.Course;
import com.smartcampus.backend.entity.Student;
import com.smartcampus.backend.service.EnrollmentService;

@RestController
@RequestMapping("/enrollment")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    // ENROLL STUDENT IN COURSE
    @PostMapping("/enroll")
    public ResponseEntity<Student> enrollStudent(
            @RequestParam Long studentId,
            @RequestParam Long courseId) {
        return ResponseEntity.ok(enrollmentService.enroll(studentId, courseId));
    }

    // UNENROLL STUDENT FROM COURSE
    @DeleteMapping("/unenroll")
    public ResponseEntity<Student> unenrollStudent(
            @RequestParam Long studentId,
            @RequestParam Long courseId) {
        return ResponseEntity.ok(enrollmentService.unenroll(studentId, courseId));
    }

    // GET ENROLLED COURSES FOR A STUDENT
    @GetMapping("/student/{studentId}/courses")
    public ResponseEntity<List<Course>> getEnrolledCourses(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrolledCourses(studentId));
    }

    // GET STUDENT BY EMAIL (for frontend to find their student record)
    @GetMapping("/by-email")
    public ResponseEntity<Student> getStudentByEmail(
            @RequestParam String email) {
        return ResponseEntity.ok(enrollmentService.getStudentByEmail(email));
    }
}
