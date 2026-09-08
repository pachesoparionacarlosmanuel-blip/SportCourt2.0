package com.sportcourt.backend.controller;

import com.sportcourt.backend.dto.LoginRequest;
import com.sportcourt.backend.dto.LoginResponse;
import com.sportcourt.backend.model.Usuario;
import com.sportcourt.backend.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller de autenticación con seguridad mejorada
 * 
 * - No expone contraseñas en respuestas
 * - Usa BCrypt para verificación de contraseñas
 * - CORS configurado de forma restrictiva en CorsConfig
 */
@RestController
@RequestMapping("/api/login")
public class LoginController {

    private final AuthService authService;

    public LoginController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Autentica un usuario y retorna sus datos sin la contraseña
     * 
     * @param datos Solicitud con email y contraseña
     * @return ResponseEntity con LoginResponse si es exitoso, 401 si falla
     */
    @PostMapping
    public ResponseEntity<?> login(@RequestBody LoginRequest datos) {
        
        // Validar entrada
        if (datos.getEmail() == null || datos.getEmail().isBlank() ||
            datos.getPassword() == null || datos.getPassword().isBlank()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Email y contraseña son requeridos"));
        }

        // Autenticar usuario
        Usuario usuario = authService.authenticate(datos.getEmail(), datos.getPassword());

        if (usuario == null) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Email o contraseña incorrectos"));
        }

        // Retornar datos del usuario sin contraseña
        LoginResponse response = new LoginResponse(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getEmail(),
            usuario.getRol()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * DTO interno para respuestas de error
     */
    public static class ErrorResponse {
        private String mensaje;

        public ErrorResponse(String mensaje) {
            this.mensaje = mensaje;
        }

        public String getMensaje() {
            return mensaje;
        }

        public void setMensaje(String mensaje) {
            this.mensaje = mensaje;
        }
    }
}