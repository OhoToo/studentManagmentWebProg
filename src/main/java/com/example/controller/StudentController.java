package com.example.controller;

import com.example.dto.StudentDto;
import com.example.service.StudentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {
    private final StudentService service;

    public StudentController(StudentService service) { this.service = service; }

    @GetMapping
    public List<StudentDto> list(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String group,
            @RequestParam(required = false) Integer dormitory,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "ID") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        return service.list(fullName, group, dormitory, page, size, sort, order);
    }

    @GetMapping("/{id}")
    public StudentDto get(@PathVariable UUID id) { return service.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentDto create(@RequestBody StudentDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public StudentDto replace(@PathVariable UUID id, @RequestBody StudentDto dto) {
        return service.replace(id, dto);
    }

    @PatchMapping("/{id}")
    public StudentDto patch(@PathVariable UUID id, @RequestBody Map<String, Object> changes) {
        return service.patch(id, changes);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
