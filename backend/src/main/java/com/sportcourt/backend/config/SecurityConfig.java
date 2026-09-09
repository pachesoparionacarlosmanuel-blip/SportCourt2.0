package com.sportcourt.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

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
                                // Desactivamos CSRF porque actualmente trabajamos con API REST.
                                .csrf(csrf -> csrf.disable())

                                .securityContext(securityContext -> securityContext.securityContextRepository(
                                                new HttpSessionSecurityContextRepository()))
                                // Configuración de autorización.
                                .authorizeHttpRequests(auth -> auth

                                                // Login público.
                                                .requestMatchers("/api/login").permitAll()

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

                                                .requestMatchers(
                                                                "/api/canchas/**",
                                                                "/api/clases/**")
                                                .hasRole("ADMIN")

                                                // Resto de rutas: cualquier usuario autenticado
                                                .anyRequest().authenticated());

                return http.build();
        }
}