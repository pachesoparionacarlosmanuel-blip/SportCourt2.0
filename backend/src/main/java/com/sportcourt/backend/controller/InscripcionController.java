package com.sportcourt.backend.controller;

import com.sportcourt.backend.dto.InscripcionDTO;
import com.sportcourt.backend.model.Inscripcion;
import com.sportcourt.backend.service.InscripcionService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para gestionar inscripciones
 * Utiliza InscripcionService para lógica de negocio con validaciones complejas
 */
@RestController
@RequestMapping("/api/inscripciones")
public class InscripcionController {

    private final InscripcionService inscripcionService;

    public InscripcionController(InscripcionService inscripcionService) {
        this.inscripcionService = inscripcionService;
    }

    /**
     * Obtener todas las inscripciones
     */
    @GetMapping
    public ResponseEntity<List<Inscripcion>> listarInscripciones() {
        List<Inscripcion> inscripciones = inscripcionService.listarInscripciones();
        return ResponseEntity.ok(inscripciones);
    }

    /**
     * Obtener una inscripción por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Inscripcion> buscarInscripcion(@PathVariable Integer id) {
        Inscripcion inscripcion = inscripcionService.obtenerInscripcion(id);
        return ResponseEntity.ok(inscripcion);
    }

    /**
     * Crear una nueva inscripción
     * Validaciones: usuario existe, clase existe, no duplicada, cupos disponibles
     */
    @PostMapping
    public ResponseEntity<Inscripcion> crearInscripcion(@Valid @RequestBody InscripcionDTO inscripcionDTO) {
        Inscripcion inscripcionSaved = inscripcionService.crearInscripcion(inscripcionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(inscripcionSaved);
    }

    /**
     * Cancelar una inscripción
     */
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Inscripcion> cancelarInscripcion(@PathVariable Integer id) {
        Inscripcion inscripcionSaved = inscripcionService.cancelarInscripcion(id);
        return ResponseEntity.ok(inscripcionSaved);
    }

    /**
     * Eliminar una inscripción
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarInscripcion(@PathVariable Integer id) {
        inscripcionService.eliminarInscripcion(id);
        return ResponseEntity.noContent().build();
    }
}