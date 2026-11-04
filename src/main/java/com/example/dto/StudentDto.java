package com.example.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import java.util.UUID;

public class StudentDto {
    @JsonProperty("ID")
    public UUID id;
    @NotBlank
    public String fullName;
    @NotNull @Pattern(regexp = "[A-Za-z][0-9]{4}")
    public String group;
    @JsonProperty("ISU")
    @NotNull @Pattern(regexp = "[0-9]{6}")
    public String isu;
    @Positive
    public Integer dormNumber;
    @Positive
    public Integer room;
    public String dateArrived;
    @NotNull
    public Boolean isForeign = false;
    @NotNull
    public String notes = "";
}
