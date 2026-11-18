package com.example.config;

import com.example.dto.RegisterRequest;
import com.example.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {
    private final AuthService service;
    private final String username;
    private final String email;
    private final String password;

    public AdminInitializer(AuthService service, @Value("${app.admin.username}") String username,
                            @Value("${app.admin.email:}") String email,
                            @Value("${app.admin.password}") String password) {
        this.service = service;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (username.isBlank() && password.isBlank()) return;
        if (username.isBlank() || password.isBlank()) {
            throw new IllegalArgumentException("Set app.admin.username and app.admin.password together");
        }
        service.createInitialAdmin(new RegisterRequest(username, email, password));
    }
}
