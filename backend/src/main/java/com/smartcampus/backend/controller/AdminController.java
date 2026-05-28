package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.entity.Student;
import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.service.StudentService;
import com.smartcampus.backend.service.UserService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private UserService userService;

    // GET ALL STUDENTS
    @GetMapping("/students")
    public List<Student> getAllStudents() {

        return studentService.getAllStudents();
    }

    // GET ALL USERS
    @GetMapping("/users")
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    // DELETE STUDENT
    @DeleteMapping("/students/{id}")
    public String deleteStudent(
            @PathVariable Long id) {

        return studentService.deleteStudent(id);
    }
}