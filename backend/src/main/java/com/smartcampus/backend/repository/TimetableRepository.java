package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findBySemester(String semester);
    List<Timetable> findBySemesterAndSection(String semester, String section);
    List<Timetable> findByDayOfWeek(String dayOfWeek);
}
