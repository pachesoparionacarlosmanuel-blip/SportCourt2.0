package com.sportcourt.backend.service;

import com.sportcourt.backend.dto.InscripcionDTO;
import com.sportcourt.backend.exception.BusinessException;
import com.sportcourt.backend.exception.ResourceNotFoundException;
import com.sportcourt.backend.model.Inscripcion;
import com.sportcourt.backend.repository.InscripcionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de negocio para inscripciones
 * CRÍTICO: Implementa validaciones de duplicados y cupos disponibles
 */
@Service
@Transactional
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;
    private final UsuarioService usuarioService;
    private final ClaseService claseService;

    public InscripcionService(InscripcionRepository inscripcionRepository,
                              UsuarioService usuarioService,
                              ClaseService claseService) {
        this.inscripcionRepository = inscripcionRepository;
        this.usuarioService = usuarioService;
        this.claseService = claseService;
    }

    /**
     * Crear una nueva inscripción con validaciones de negocio
     * 
     * Validaciones:
     * 1. Usuario existe
     * 2. Clase existe
     * 3. NO hay inscripción duplicada (mismo usuario, clase)
     * 4. Hay cupos disponibles
     */
    public Inscripcion crearInscripcion(InscripcionDTO inscripcionDTO) {
        // Validación 1: Usuario existe
        usuarioService.verificarUsuarioExiste(inscripcionDTO.getUsuarioId());

        // Validación 2: Clase existe
        claseService.obtenerClase(inscripcionDTO.getClaseId());

        // Validación 3: NO hay inscripción duplicada
        validarNoDuplicada(inscripcionDTO);

        // Validación 4: Hay cupos disponibles
        validarCuposDisponibles(inscripcionDTO.getClaseId());

        // Crear y guardar
        Inscripcion inscripcion = new Inscripcion();
        inscripcion.setUsuarioId(inscripcionDTO.getUsuarioId());
        inscripcion.setClaseId(inscripcionDTO.getClaseId());
        inscripcion.setFecha(inscripcionDTO.getFecha());
        inscripcion.setEstado(inscripcionDTO.getEstado());

        return inscripcionRepository.save(inscripcion);
    }

    /**
     * Obtener inscripción por ID
     */
    public Inscripcion obtenerInscripcion(Integer id) {
        return inscripcionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción con ID " + id + " no encontrada"));
    }

    /**
     * Listar todas las inscripciones
     */
    public List<Inscripcion> listarInscripciones() {
        return inscripcionRepository.findAll();
    }

    /**
     * Obtener inscripciones de un usuario
     */
    public List<Inscripcion> obtenerInscripcionesDeUsuario(Integer usuarioId) {
        usuarioService.verificarUsuarioExiste(usuarioId);
        return inscripcionRepository.findAll().stream()
                .filter(i -> i.getUsuarioId().equals(usuarioId))
                .toList();
    }

    /**
     * Cancelar una inscripción
     */
    public Inscripcion cancelarInscripcion(Integer id) {
        Inscripcion inscripcion = obtenerInscripcion(id);
        inscripcion.setEstado("cancelada");
        return inscripcionRepository.save(inscripcion);
    }

    /**
     * Eliminar una inscripción
     */
    public void eliminarInscripcion(Integer id) {
        obtenerInscripcion(id);  // Verifica que existe
        inscripcionRepository.deleteById(id);
    }

    /**
     * VALIDACIÓN 3: Verificar NO hay inscripción duplicada
     * 
     * Criterios de duplicado:
     * - Mismo usuario
     * - Misma clase
     * - Estado NO cancelada
     */
    private void validarNoDuplicada(InscripcionDTO inscripcionDTO) {
        boolean yaInscrito = inscripcionRepository.findAll().stream()
                .filter(i -> i.getUsuarioId().equals(inscripcionDTO.getUsuarioId()))
                .filter(i -> i.getClaseId().equals(inscripcionDTO.getClaseId()))
                .filter(i -> !i.getEstado().equals("cancelada"))
                .findAny()
                .isPresent();

        if (yaInscrito) {
            throw new BusinessException(
                    "El usuario ya está inscrito en esta clase. " +
                    "Clase ID: " + inscripcionDTO.getClaseId()
            );
        }
    }

    /**
     * VALIDACIÓN 4: Verificar cupos disponibles
     * 
     * Cupos disponibles = cupos totales - inscripciones activas
     */
    private void validarCuposDisponibles(Integer claseId) {
        Integer cuposTotales = claseService.obtenerCuposDisponibles(claseId);

        // Contar inscripciones activas en esta clase
        long inscripcionesActivas = inscripcionRepository.findAll().stream()
                .filter(i -> i.getClaseId().equals(claseId))
                .filter(i -> !i.getEstado().equals("cancelada"))
                .count();

        if (inscripcionesActivas >= cuposTotales) {
            throw new BusinessException(
                    "No hay cupos disponibles en la clase. " +
                    "Cupos: " + cuposTotales + ", " +
                    "Inscripciones activas: " + inscripcionesActivas
            );
        }
    }
}
