package com.smartcampus.backend.service;

import java.util.List;
import java.util.Optional;

import com.smartcampus.backend.jwt.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.dto.LoginRequest;
import com.smartcampus.backend.dto.LoginResponse;
import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Normalize role: always store without ROLE_ prefix (e.g. ADMIN, STUDENT)
    private String normalizeRole(String role) {
        if (role == null) return "STUDENT";
        String r = role.trim().toUpperCase();
        if (r.startsWith("ROLE_")) r = r.substring(5);
        return r;
    }

    // REGISTER USER
    public User saveUser(User user) {
        user.setRole(normalizeRole(user.getRole()));
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }

    // GET ALL USERS
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET USER BY ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // LOGIN USER — returns normalized role (ADMIN / STUDENT), userId, name
    public LoginResponse loginUser(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return new LoginResponse("Invalid email or password", null);
        }

        User user = optionalUser.get();

        boolean isPasswordCorrect = passwordEncoder.matches(
                request.getPassword(), user.getPassword());

        if (isPasswordCorrect) {
            // Fix role in DB if it still has ROLE_ prefix
            String normalizedRole = normalizeRole(user.getRole());
            if (!normalizedRole.equals(user.getRole())) {
                user.setRole(normalizedRole);
                userRepository.save(user);
            }

            String token = jwtUtil.generateToken(user.getEmail());
            return new LoginResponse(
                    "Login successful",
                    token,
                    normalizedRole,   // always ADMIN or STUDENT
                    user.getId(),
                    user.getName()
            );
        }

        return new LoginResponse("Invalid email or password", null);
    }

    // UPDATE USER
    public User updateUser(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getRole() != null) {
            existingUser.setRole(normalizeRole(updatedUser.getRole()));
        }

        return userRepository.save(existingUser);
    }

    // DELETE USER
    public String deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return "User deleted successfully";
    }
}
