package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.entity.Announcement;
import com.smartcampus.backend.repository.AnnouncementRepository;

@RestController
@RequestMapping("/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping
    public List<Announcement> getAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Announcement create(@RequestBody Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Announcement> update(
            @PathVariable Long id,
            @RequestBody Announcement updated) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        a.setTitle(updated.getTitle());
        a.setContent(updated.getContent());
        a.setCategory(updated.getCategory());
        a.setPostedBy(updated.getPostedBy());
        return ResponseEntity.ok(announcementRepository.save(a));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
