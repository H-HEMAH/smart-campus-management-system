package com.smartcampus.backend.controller;

import java.util.List;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.entity.Student;
import com.smartcampus.backend.service.StudentService;

@RestController
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    // SAVE
    @PostMapping
    public Student saveStudent(
    		@Valid @RequestBody Student student) {

        return studentService.saveStudent(student);
    }

    // GET ALL
    @GetMapping
    public List<Student> getAllStudents() {

        return studentService.getAllStudents();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Student getStudentById(
            @PathVariable Long id) {

        return studentService.getStudentById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Student updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody Student student) {

        return studentService.updateStudent(id, student);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteStudent(
            @PathVariable Long id) {

        return studentService.deleteStudent(id);
    }
}