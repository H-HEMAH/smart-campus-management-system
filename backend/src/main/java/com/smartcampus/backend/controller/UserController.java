package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.backend.dto.LoginRequest;
import com.smartcampus.backend.dto.LoginResponse;
import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Register User API
    @PostMapping
    public User createUser(@RequestBody User user) {

        return userService.saveUser(user);
    }

    // Get All Users API
    @GetMapping
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    // Get User By ID API
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {

        return userService.getUserById(id);
    }

    // Login API
    @PostMapping("/login")
    public LoginResponse loginUser(
            @RequestBody LoginRequest loginRequest) {

        return userService.loginUser(loginRequest);
    }

    // Update User API
    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        return userService.updateUser(id, user);
    }

    // Delete User API
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {

        return userService.deleteUser(id);
    }
}