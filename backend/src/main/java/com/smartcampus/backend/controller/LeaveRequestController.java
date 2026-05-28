package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.entity.LeaveRequest;
import com.smartcampus.backend.repository.LeaveRequestRepository;

@RestController
@RequestMapping("/leave")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    // ALL (admin)
    @GetMapping
    public List<LeaveRequest> getAll() {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    // BY STUDENT EMAIL
    @GetMapping("/student")
    public List<LeaveRequest> getByEmail(@RequestParam String email) {
        return leaveRequestRepository.findByStudentEmail(email);
    }

    // BY STUDENT ID
    @GetMapping("/student/{studentId}")
    public List<LeaveRequest> getByStudentId(@PathVariable Long studentId) {
        return leaveRequestRepository.findByStudentId(studentId);
    }

    // SUBMIT
    @PostMapping
    public LeaveRequest submit(@RequestBody LeaveRequest request) {
        return leaveRequestRepository.save(request);
    }

    // APPROVE / REJECT (admin)
    @PutMapping("/{id}/status")
    public ResponseEntity<LeaveRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        lr.setStatus(status);
        if (remarks != null) lr.setAdminRemarks(remarks);
        return ResponseEntity.ok(leaveRequestRepository.save(lr));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        leaveRequestRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
