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

                                // Content-Security-Policy para las respuestas del backend.
                                // La política real para el frontend vive en el <meta> de cada
                                // .html, porque las páginas no las sirve este backend.
                                .headers(headers -> headers
                                                .contentSecurityPolicy(csp -> csp.policyDirectives(
                                                                "default-src 'self'; " +
                                                                                "script-src 'self'; " +
                                                                                "style-src 'self' 'unsafe-inline'; " +
                                                                                "img-src 'self' https://images.unsplash.com data:; "
                                                                                +
                                                                                "font-src 'self'; " +
                                                                                "connect-src 'self'; " +
                                                                                "object-src 'none'; " +
                                                                                "base-uri 'self'; " +
                                                                                "form-action 'self'; " +
                                                                                "frame-ancestors 'self';")))

                                .securityContext(securityContext -> securityContext.securityContextRepository(
                                                new HttpSessionSecurityContextRepository()))
                                // Configuración de autorización.
                                .authorizeHttpRequests(auth -> auth

                                                // Login público.
                                                .requestMatchers("/api/login", "/api/csrf").permitAll()
                                                .requestMatchers("/api/csrf").permitAll()

                                                // Documentación OpenAPI / Swagger UI.
                                                .requestMatchers(
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html")
                                                .permitAll()

                                                // Visitante (sin login): puede ver canchas y clases disponibles.
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/canchas/**",
                                                                "/api/clases/**")
                                                .permitAll()

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

        // La configuración CORS vive únicamente en CorsConfig.java (WebMvcConfigurer)
        // para evitar dos fuentes de verdad con orígenes inconsistentes.

}