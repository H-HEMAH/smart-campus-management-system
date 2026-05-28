package com.smartcampus.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.entity.Course;
import com.smartcampus.backend.entity.Student;
import com.smartcampus.backend.repository.CourseRepository;
import com.smartcampus.backend.repository.StudentRepository;

@Service
public class EnrollmentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    // ENROLL
    public Student enroll(Long studentId, Long courseId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<Course> courses = student.getCourses();
        if (courses == null) courses = new ArrayList<>();

        boolean alreadyEnrolled = courses.stream().anyMatch(c -> c.getId().equals(courseId));
        if (alreadyEnrolled) {
            throw new RuntimeException("Already enrolled in this course");
        }

        courses.add(course);
        student.setCourses(courses);
        return studentRepository.save(student);
    }

    // UNENROLL
    public Student unenroll(Long studentId, Long courseId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Course> courses = student.getCourses();
        if (courses != null) {
            courses.removeIf(c -> c.getId().equals(courseId));
            student.setCourses(courses);
        }

        return studentRepository.save(student);
    }

    // GET ENROLLED COURSES
    public List<Course> getEnrolledCourses(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return student.getCourses() != null ? student.getCourses() : new ArrayList<>();
    }

    // GET STUDENT BY EMAIL — uses indexed repository query
    public Student getStudentByEmail(String email) {
        return studentRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Student record not found for email: " + email));
    }
}
