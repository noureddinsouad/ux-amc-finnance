Here is a complete, working example using a single String column named user_type (instead of a collection called roles) to determine access.
This setup handles the ROLE_ prefix mapping dynamically, allowing you to store clean values like "ADMIN" or "USER" in your database while still being able to use standard Spring Security role checks like .hasRole("ADMIN").

1. Database Schema & Entity (UserApp.java)

We map a single database column named user_type. Inside getAuthorities(), we append the ROLE_ prefix on the fly so Spring Security recognizes it as a formal role.
java
package com.example.demo.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users")
public class UserApp implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    // Custom database column naming
    @Column(name = "user_type", nullable = false)
    private String userType; // Stores clean strings like: "ADMIN", "USER", "MANAGER"

    // Map your custom column into Spring Security's expected authority framework
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Enforce the 'ROLE_' prefix if it isn't already stored that way in your database
        String formattedRole = userType.toUpperCase().startsWith("ROLE_") ? 
                               userType.toUpperCase() : "ROLE_" + userType.toUpperCase();
        
        return Collections.singletonList(new SimpleGrantedAuthority(formattedRole));
    }

    @Override public String getPassword() { return this.password; }
    @Override public String getUsername() { return this.username; }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    // Boilerplate Boilerplate
    public UserApp() {}
    public UserApp(String username, String password, String userType) {
        this.username = username;
        this.password = password;
        this.userType = userType;
    }

    public Long getId() { return id; }
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
}
Use code with caution.

2. JPA Repository Layer (UserRepository.java)

java
package com.example.demo.repository;

import com.example.demo.model.UserApp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserApp, Long> {
    Optional<UserApp> findByUsername(String username);
}
Use code with caution.

3. User Details Loader Service (CustomUserDetailsService.java)

java
package com.example.demo.service;

import com.example.demo.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User identity not found: " + username));
    }
}
Use code with caution.

4. Security System Rules (WebSecurityConfig.java)

java
package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    private final UserDetailsService userDetailsService;

    public WebSecurityConfig(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disabled for streamlined API endpoint testing
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                // Checks mapped GrantedAuthority strings starting with 'ROLE_' automatically
                .requestMatchers("/api/admin/**").hasRole("ADMIN") 
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
Use code with caution.

5. API Gateway Controller (AppController.java)

java
package com.example.demo.controller;

import com.example.demo.model.UserApp;
import com.example.demo.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AppController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AppController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Unsecured Endpoint: Save user details with custom userType string
    @PostMapping("/auth/register")
    public String register(@RequestParam String username, 
                           @RequestParam String password, 
                           @RequestParam String userType) {
        UserApp newUser = new UserApp(
                username,
                passwordEncoder.encode(password),
                userType.toUpperCase() // Stores pure string e.g., "ADMIN" or "USER"
        );
        userRepository.save(newUser);
        return "Successfully registered user with type: " + userType.toUpperCase();
    }

    // Guarded by URL Configuration Layer (Requires converted ROLE_ADMIN)
    @GetMapping("/admin/data")
    public String getAdminData() {
        return "Secure Admin View: Accessed via 'ADMIN' userType processing.";
    }

    // Guarded by Method Annotation Layer (Requires converted ROLE_USER or ROLE_ADMIN)
    @GetMapping("/user/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public String getUserProfile() {
        return "Secure User View: Accessed via configured string conversions.";
    }
}
Use code with caution.
Now that your structural mapping is sorted, tell me:
• Would you like to see how to implement custom method-level security expressions (e.g., checking if the logged-in user explicitly owns the resource ID they are trying to modify)?
• Do you need assistance handling security exceptions globally to return custom clean JSON responses for access violations?
