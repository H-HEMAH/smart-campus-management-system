package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.entity.Assignment;
import com.smartcampus.backend.repository.AssignmentRepository;

@RestController
@RequestMapping("/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @GetMapping
    public List<Assignment> getAll() {
        return assignmentRepository.findAllByOrderByDeadlineAsc();
    }

    @GetMapping("/course/{courseId}")
    public List<Assignment> getByCourse(@PathVariable Long courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }

    @PostMapping
    public Assignment create(@RequestBody Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assignment> update(
            @PathVariable Long id,
            @RequestBody Assignment updated) {
        Assignment a = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        a.setTitle(updated.getTitle());
        a.setDescription(updated.getDescription());
        a.setDeadline(updated.getDeadline());
        a.setCourseId(updated.getCourseId());
        a.setCourseName(updated.getCourseName());
        return ResponseEntity.ok(assignmentRepository.save(a));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        assignmentRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
