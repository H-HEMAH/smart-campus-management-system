package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.entity.Timetable;
import com.smartcampus.backend.repository.TimetableRepository;

@RestController
@RequestMapping("/timetable")
public class TimetableController {

    @Autowired
    private TimetableRepository timetableRepository;

    @GetMapping
    public List<Timetable> getAll() {
        return timetableRepository.findAll();
    }

    @GetMapping("/semester/{semester}")
    public List<Timetable> getBySemester(@PathVariable String semester) {
        return timetableRepository.findBySemester(semester);
    }

    @GetMapping("/filter")
    public List<Timetable> filter(
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String section) {
        if (semester != null && section != null) {
            return timetableRepository.findBySemesterAndSection(semester, section);
        }
        if (semester != null) {
            return timetableRepository.findBySemester(semester);
        }
        return timetableRepository.findAll();
    }

    @PostMapping
    public Timetable create(@RequestBody Timetable timetable) {
        return timetableRepository.save(timetable);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Timetable> update(
            @PathVariable Long id,
            @RequestBody Timetable updated) {
        Timetable t = timetableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        t.setCourseName(updated.getCourseName());
        t.setInstructor(updated.getInstructor());
        t.setDayOfWeek(updated.getDayOfWeek());
        t.setStartTime(updated.getStartTime());
        t.setEndTime(updated.getEndTime());
        t.setRoom(updated.getRoom());
        t.setSemester(updated.getSemester());
        t.setSection(updated.getSection());
        return ResponseEntity.ok(timetableRepository.save(t));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        timetableRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
