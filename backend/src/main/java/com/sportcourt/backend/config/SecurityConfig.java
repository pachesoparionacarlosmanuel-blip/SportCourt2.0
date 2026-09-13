package com.sportcourt.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.http.HttpMethod;

@Configuration
public class SecurityConfig {

        /**
         * Codificador BCrypt para las contraseñas.
         */
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(10);
        }

        /**
         * Configuración principal de seguridad.
         */
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                // Protección CSRF para la autenticación basada en sesión.
                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(
                                                                org.springframework.security.web.csrf.CookieCsrfTokenRepository
                                                                                .withHttpOnlyFalse()))

                                .securityContext(securityContext -> securityContext.securityContextRepository(
                                                new HttpSessionSecurityContextRepository()))
                                // Configuración de autorización.
                                .authorizeHttpRequests(auth -> auth

                                                // Login público.
                                                .requestMatchers("/api/login", "/api/csrf").permitAll()
                                                .requestMatchers("/api/csrf").permitAll()

                                                // Archivos del frontend.
                                                .requestMatchers(
                                                                "/",
                                                                "/index.html",
                                                                "/login.html",
                                                                "/canchas.html",
                                                                "/clases.html",
                                                                "/reservas.html",
                                                                "/perfil.html",
                                                                "/admin.html",
                                                                "/assets/**")
                                                .permitAll()

                                                // Usuarios administradores
                                                .requestMatchers(
                                                                "/api/usuarios/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(org.springframework.http.HttpMethod.DELETE,
                                                                "/api/reservas/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/canchas/**",
                                                                "/api/clases/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/canchas/**",
                                                                "/api/clases/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/api/canchas/**",
                                                                "/api/clases/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                "/api/canchas/**",
                                                                "/api/clases/**")
                                                .authenticated()

                                                // Resto de rutas: cualquier usuario autenticado
                                                .anyRequest().authenticated());

                return http.build();
        }

        @Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
                org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();

                configuration.setAllowedOrigins(java.util.List.of(
                                "http://localhost:5500",
                                "http://127.0.0.1:5500"));

                configuration.setAllowedMethods(java.util.List.of(
                                "GET", "POST", "PUT", "DELETE", "OPTIONS"));

                configuration.setAllowedHeaders(java.util.List.of("*"));
                configuration.setAllowCredentials(true);

                org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration("/**", configuration);

                return source;
        }

}