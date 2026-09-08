package com.sportcourt.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuración de seguridad de SportCourt 2.0
 * 
 * Define los beans necesarios para encriptación de contraseñas con BCrypt
 */
@Configuration
public class SecurityConfig {

    /**
     * PasswordEncoder usando BCrypt
     * Strength = 10 es el valor por defecto recomendado
     * 
     * @return BCryptPasswordEncoder con strength 10
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
