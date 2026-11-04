package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "students", uniqueConstraints = @UniqueConstraint(name = "uk_student_isu", columnNames = "isu"))
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, columnDefinition = "text")
    private String fullName;
    @Column(name = "group_name", nullable = false)
    private String group;
    @Column(nullable = false, length = 6)
    private String isu;
    private Integer dormNumber;
    private Integer room;
    private LocalDate dateArrived;
    @Column(nullable = false)
    private boolean foreignStudent;
    @Column(nullable = false, columnDefinition = "text")
    private String notes;

    public UUID getId() { return id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getGroup() { return group; }
    public void setGroup(String group) { this.group = group; }
    public String getIsu() { return isu; }
    public void setIsu(String isu) { this.isu = isu; }
    public Integer getDormNumber() { return dormNumber; }
    public void setDormNumber(Integer dormNumber) { this.dormNumber = dormNumber; }
    public Integer getRoom() { return room; }
    public void setRoom(Integer room) { this.room = room; }
    public LocalDate getDateArrived() { return dateArrived; }
    public void setDateArrived(LocalDate dateArrived) { this.dateArrived = dateArrived; }
    public boolean isForeignStudent() { return foreignStudent; }
    public void setForeignStudent(boolean foreignStudent) { this.foreignStudent = foreignStudent; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
