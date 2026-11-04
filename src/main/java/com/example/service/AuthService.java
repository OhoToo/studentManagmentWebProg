package com.example.service;

import com.example.dto.*;
import com.example.entity.AppUser;
import com.example.entity.Role;
import com.example.exception.ApiException;
import com.example.repository.UserRepository;
import com.example.security.JwtService;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Validator validator;

    public AuthService(UserRepository repository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, Validator validator) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.validator = validator;
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        AppUser user = createUser(request, Role.USER);
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    private AppUser createUser(RegisterRequest request, Role role) {
        if (request.email == null || request.email.isBlank()) request.email = "";
        var violations = validator.validate(request);
        if (!violations.isEmpty()) {
            var error = violations.iterator().next();
            throw new ApiException(422, error.getPropertyPath() + ": " + error.getMessage());
        }
        if (request.password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(422, "Password must contain at most 72 UTF-8 bytes");
        }
        String username = request.username.strip();
        String email = request.email.strip().toLowerCase(Locale.ROOT);
        if (repository.existsByUsername(username)) throw new ApiException(409, "Username already exists");
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password));
        user.setRole(role);
        repository.saveAndFlush(user);
        log.info("Created user with id {} and role {}", user.getId(), role);
        return user;
    }

    public TokenResponse login(LoginRequest request) {
        AppUser user = repository.findByUsername(request.username.strip()).orElse(null);
        boolean validPassword = false;
        if (user != null && request.password.getBytes(StandardCharsets.UTF_8).length <= 72) {
            validPassword = passwordEncoder.matches(request.password, user.getPasswordHash());
        }
        if (user == null || !validPassword) {
            log.info("Login rejected");
            throw new ApiException(401, "Invalid username or password");
        }
        log.info("Successful login for user {}", user.getId());
        return jwtService.issueTokens(user);
    }

    public TokenResponse refresh(RefreshRequest request) {
        UUID id;
        try {
            id = UUID.fromString(jwtService.readRefreshToken(request.refreshToken).getSubject());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new ApiException(401, "Invalid or expired refresh token");
        }
        AppUser user = repository.findById(id).orElse(null);
        if (user == null) throw new ApiException(401, "User not found");
        return jwtService.issueTokens(user);
    }

    @Transactional
    public void createInitialAdmin(RegisterRequest request) {
        AppUser existing = repository.findByUsername(request.username.strip()).orElse(null);
        if (existing != null) {
            if (existing.getRole() != Role.ADMIN) {
                throw new IllegalArgumentException("app.admin.username belongs to a USER; choose another name");
            }
            return;
        }
        createUser(request, Role.ADMIN);
    }
}
