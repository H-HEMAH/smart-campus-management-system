package com.smartcampus.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.entity.Student;
import com.smartcampus.backend.repository.StudentRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    // SAVE
    public Student saveStudent(Student student) {

        return studentRepository.save(student);
    }

    // GET ALL
    public List<Student> getAllStudents() {

        return studentRepository.findAll();
    }

    // GET BY ID
    public Student getStudentById(Long id) {

        return studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));
    }

    // UPDATE
    public Student updateStudent(Long id,
                                 Student updatedStudent) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        student.setName(updatedStudent.getName());
        student.setDepartment(updatedStudent.getDepartment());
        student.setEmail(updatedStudent.getEmail());

        // IMPORTANT FOR MANY-TO-MANY
        student.setCourses(updatedStudent.getCourses());

        return studentRepository.save(student);
    }

    // DELETE
    public String deleteStudent(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        studentRepository.delete(student);

        return "Student deleted successfully";
    }
}