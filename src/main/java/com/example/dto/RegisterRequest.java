package com.example.dto;

import jakarta.validation.constraints.*;

public class RegisterRequest {
    @NotBlank @Size(max = 255)
    public String username;
    @Email @Size(max = 255)
    public String email;
    @NotBlank// @Size(min=8)
    public String password;

    public RegisterRequest() {}

    public RegisterRequest(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}
