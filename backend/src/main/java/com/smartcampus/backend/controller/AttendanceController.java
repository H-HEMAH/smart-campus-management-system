package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.entity.Attendance;
import com.smartcampus.backend.repository.AttendanceRepository;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @GetMapping
    public List<Attendance> getAll() {
        return attendanceRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getByStudent(@PathVariable Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @GetMapping("/course/{courseId}")
    public List<Attendance> getByCourse(@PathVariable Long courseId) {
        return attendanceRepository.findByCourseId(courseId);
    }

    @PostMapping
    public Attendance mark(@RequestBody Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @PostMapping("/bulk")
    public List<Attendance> markBulk(@RequestBody List<Attendance> attendances) {
        return attendanceRepository.saveAll(attendances);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attendance> update(
            @PathVariable Long id,
            @RequestBody Attendance updated) {
        Attendance a = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        a.setStatus(updated.getStatus());
        a.setDate(updated.getDate());
        return ResponseEntity.ok(attendanceRepository.save(a));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        attendanceRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
