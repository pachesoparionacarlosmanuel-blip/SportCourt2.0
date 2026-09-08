package com.sportcourt.backend.controller;

import com.sportcourt.backend.dto.UsuarioDTO;
import com.sportcourt.backend.service.UsuarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para gestionar usuarios
 * Utiliza UsuarioService para lógica de negocio
 */
@RestController
@RequestMapping("/api")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Obtener todos los usuarios
     */
    @GetMapping("/usuarios")
    public ResponseEntity<List<com.sportcourt.backend.model.Usuario>> listarUsuarios() {
        List<com.sportcourt.backend.model.Usuario> usuarios = usuarioService.listarUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Obtener un usuario por ID (sin contraseña)
     */
    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioDTO> buscarUsuario(@PathVariable Integer id) {
        UsuarioDTO usuarioDTO = usuarioService.obtenerUsuarioDTO(id);
        return ResponseEntity.ok(usuarioDTO);
    }
}