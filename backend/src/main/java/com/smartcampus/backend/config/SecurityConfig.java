package com.smartcampus.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

import com.smartcampus.backend.jwt.JwtFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@OpenAPIDefinition
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow both Vite dev server ports
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // SWAGGER
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // LOGIN + REGISTER
                        .requestMatchers("/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/users").permitAll()

                        // ADMIN-ONLY endpoints
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/announcements").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/announcements/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/announcements/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/attendance").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/attendance/bulk").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/attendance/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/attendance/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/assignments").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/assignments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/assignments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/timetable").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/timetable/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/timetable/**").hasRole("ADMIN")
                        // Leave: GET all = admin, POST = any auth, GET by student = any auth
                        .requestMatchers(HttpMethod.GET,    "/leave").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/leave/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/leave/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/users").hasRole("ADMIN")

                        // POST student = admin only (creating student records)
                        .requestMatchers(HttpMethod.POST,   "/student").hasRole("ADMIN")
                        // FIX: Allow STUDENT role to PUT (update own profile); DELETE remains ADMIN only
                        .requestMatchers(HttpMethod.PUT,    "/student/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/student/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/course").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/course/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/course/**").hasRole("ADMIN")

                        // STUDENT + ADMIN shared endpoints
                        .requestMatchers(HttpMethod.GET,    "/student/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/student").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/course/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/course").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers("/enrollment/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/announcements").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/announcements/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/attendance/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/assignments/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/timetable/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/leave").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/leave/student/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/leave/student").hasAnyRole("STUDENT", "ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
