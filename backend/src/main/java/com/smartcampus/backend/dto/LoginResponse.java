package com.smartcampus.backend.dto;

public class LoginResponse {

    private String message;
    private String token;
    private String role;
    private Long userId;
    private String name;

    public LoginResponse(String message, String token) {
        this.message = message;
        this.token = token;
    }

    public LoginResponse(String message, String token, String role, Long userId, String name) {
        this.message = message;
        this.token = token;
        this.role = role;
        this.userId = userId;
        this.name = name;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
