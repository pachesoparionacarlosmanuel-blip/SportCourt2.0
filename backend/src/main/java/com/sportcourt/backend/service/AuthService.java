package com.sportcourt.backend.service;

import com.sportcourt.backend.model.Usuario;
import com.sportcourt.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Servicio de autenticación seguro con encriptación de contraseñas
 */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }
    /**
     * Autentica un usuario verificando email y contraseña
     * 
     * @param email    Email del usuario
     * @param password Contraseña sin encriptar
     * @return Usuario si la autenticación es exitosa, null si falla
     */
    public Usuario authenticate(String email, String password) {
        return usuarioRepository
            .findByEmail(email)
            .filter(usuario -> passwordEncoder.matches(password, usuario.getPassword()))
            .orElse(null);
    }
    /**
     * Encripta una contraseña en texto plano
     * 
     * @param password Contraseña sin encriptar
     * @return Contraseña encriptada
     */
    public String encryptPassword(String password) {
        return passwordEncoder.encode(password);
    }
    /**
     * Verifica si una contraseña coincide con su hash
     * 
     * @param rawPassword      Contraseña sin encriptar
     * @param encodedPassword  Contraseña encriptada
     * @return true si coinciden, false en caso contrario
     */
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
