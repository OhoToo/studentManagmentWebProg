package com.example.dto;

import com.example.entity.Role;
import java.util.UUID;

public class UserDto {
    public UUID id;
    public String username;
    public String email;
    public Role role;

    public UserDto(UUID id, String username, String email, Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }
}
