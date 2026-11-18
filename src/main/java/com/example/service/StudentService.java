package com.example.service;

import com.example.dto.StudentDto;
import com.example.entity.Student;
import com.example.exception.ApiException;
import com.example.repository.StudentRepository;
import jakarta.validation.Validator;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import tools.jackson.core.JacksonException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class StudentService {
    private final StudentRepository repository;
    private final Validator validator;
    private final ObjectMapper mapper;
    private static final Map<String, String> SORT_FIELDS = Map.of(
        "ID", "id", "fullName", "fullName", "group", "group", "ISU", "isu",
        "dormNumber", "dormNumber", "room", "room", "dateArrived", "dateArrived",
        "isForeign", "foreignStudent", "notes", "notes");

    public StudentService(StudentRepository repository, Validator validator, ObjectMapper mapper) {
        this.repository = repository;
        this.validator = validator;
        this.mapper = mapper;
    }

    public List<StudentDto> list(String fullName, String group, Integer dormitory,
                                 Integer page, Integer size, String sort, String order) {
        if (page != null && page < 0) {
            throw new ApiException(400, "page must be >= 0");
        }
        if (size != null && size < 1) {
            throw new ApiException(400, "size must be > 0");
        }
        if (dormitory != null && dormitory < 1) {
            throw new ApiException(400, "dormitory must be > 0");
        }
        String property = SORT_FIELDS.get(sort);
        if (property == null || !(order.equalsIgnoreCase("asc") || order.equalsIgnoreCase("desc"))) {
            throw new ApiException(400, "Invalid sort field or order (asc/desc)");
        }
        Sort sorting = Sort.by(Sort.Direction.fromString(order), property);
        if (!property.equals("id")) sorting = sorting.and(Sort.by("id"));
        List<StudentDto> students = new ArrayList<>();
        for (Student student : repository.findAll(sorting)) {
            if (matchesFilters(student, fullName, group, dormitory)) {
                students.add(toDto(student));
            }
        }
        if (page == null && size == null) {
            return students;
        }
        int pageNumber = page == null ? 0 : page;
        int pageSize = size == null ? 20 : size;
        long offset = (long) pageNumber * pageSize;
        int start = (int) Math.min(offset, students.size());
        int end = (int) Math.min((long) start + pageSize, students.size());
        return students.subList(start, end);
    }

    private boolean matchesFilters(Student student, String fullName, String group, Integer dormitory) {
        if (fullName != null && !fullName.isBlank()) {
            String name = student.getFullName().toLowerCase(Locale.ROOT);
            for (String word : fullName.strip().toLowerCase(Locale.ROOT).split("\\s+")) {
                if (!name.contains(word)) return false;
            }
        }
        if (group != null && !group.isBlank() && !student.getGroup().equalsIgnoreCase(group.strip())) {
            return false;
        }
        if (dormitory != null && !dormitory.equals(student.getDormNumber())) return false;
        return true;
    }

    public StudentDto get(UUID id) { return toDto(find(id)); }

    @Transactional
    public StudentDto create(StudentDto dto) {
        validate(dto);
        if (repository.existsByIsu(dto.isu)) throw new ApiException(409, "Student with this ISU already exists");
        Student student = new Student();
        apply(student, dto);
        return toDto(repository.saveAndFlush(student));
    }

    @Transactional
    public StudentDto replace(UUID id, StudentDto dto) {
        Student student = find(id);
        validateId(id, dto.id);
        validate(dto);
        checkUniqueIsu(dto.isu, id);
        apply(student, dto);
        return toDto(repository.saveAndFlush(student));
    }

    @Transactional
    public StudentDto patch(UUID id, Map<String, Object> fields) {
        Student student = find(id);
        JsonNode changes = mapper.valueToTree(fields);
        if (changes.has("ID") && !changes.get("ID").equals(mapper.valueToTree(id.toString()))) {
            throw new ApiException(400, "ID cannot be changed");
        }
        ObjectNode merged = mapper.valueToTree(toDto(student));
        for (String name : changes.propertyNames()) merged.set(name, changes.get(name));
        StudentDto dto;
        try {
            dto = mapper.treeToValue(merged, StudentDto.class);
        } catch (JacksonException ex) {
            throw new ApiException(422, "Invalid student field type");
        }
        validateId(id, dto.id);
        validate(dto);
        checkUniqueIsu(dto.isu, id);
        apply(student, dto);
        return toDto(repository.saveAndFlush(student));
    }

    @Transactional
    public void delete(UUID id) { repository.delete(find(id)); }

    private Student find(UUID id) {
        Student student = repository.findById(id).orElse(null);
        if (student == null) throw new ApiException(404, "Student not found");
        return student;
    }

    private void checkUniqueIsu(String isu, UUID id) {
        if (repository.existsByIsuAndIdNot(isu, id)) throw new ApiException(409, "Student with this ISU already exists");
    }

    private void validateId(UUID id, UUID suppliedId) {
        if (suppliedId != null && !suppliedId.equals(id)) throw new ApiException(400, "ID cannot be changed");
    }

    private void validate(StudentDto dto) {
        var violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            var violation = violations.iterator().next();
            throw new ApiException(422, violation.getPropertyPath() + ": " + violation.getMessage());
        }
        String[] words = dto.fullName.strip().split("\\s+");
        if (words.length < 2) {
            throw new ApiException(422, "fullName must contain at least two words of at least two characters");
        }
        for (String word : words) {
            if (word.length() < 2) throw new ApiException(422, "Each word in fullName must contain at least two characters");
        }
        if (dto.dateArrived != null && !dto.dateArrived.isEmpty()) {
            try {
                if (!dto.dateArrived.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}")) throw new DateTimeParseException("format", dto.dateArrived, 0);
                LocalDate.parse(dto.dateArrived);
            } catch (DateTimeParseException ex) {
                throw new ApiException(422, "dateArrived must have format YYYY-MM-DD and be a valid date");
            }
        }
    }

    private void apply(Student student, StudentDto dto) {
        String[] words = dto.fullName.strip().split("\\s+");
        for (int i = 0; i < words.length; i++) {
            words[i] = words[i].substring(0, 1).toUpperCase(Locale.ROOT) + words[i].substring(1).toLowerCase(Locale.ROOT);
        }
        student.setFullName(String.join(" ", words));
        student.setGroup(dto.group.toUpperCase(Locale.ROOT));
        student.setIsu(dto.isu);
        student.setDormNumber(dto.dormNumber);
        LocalDate arrived = dto.dormNumber == null || dto.dateArrived == null || dto.dateArrived.isEmpty()
            ? null : LocalDate.parse(dto.dateArrived);
        student.setDateArrived(arrived);
        student.setRoom(arrived == null ? null : dto.room);
        student.setForeignStudent(dto.isForeign);
        student.setNotes(dto.notes);
    }

    private StudentDto toDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.id = student.getId();
        dto.fullName = student.getFullName();
        dto.group = student.getGroup();
        dto.isu = student.getIsu();
        dto.dormNumber = student.getDormNumber();
        dto.room = student.getRoom();
        dto.dateArrived = student.getDateArrived() == null ? null : student.getDateArrived().toString();
        dto.isForeign = student.isForeignStudent();
        dto.notes = student.getNotes();
        return dto;
    }
}
