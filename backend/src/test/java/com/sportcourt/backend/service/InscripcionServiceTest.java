package com.sportcourt.backend.service;

import com.sportcourt.backend.dto.InscripcionDTO;
import com.sportcourt.backend.exception.BusinessException;
import com.sportcourt.backend.exception.ResourceNotFoundException;
import com.sportcourt.backend.model.Inscripcion;
import com.sportcourt.backend.repository.InscripcionRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para InscripcionService
 * 
 * Casos críticos:
 * 1. Usuario existe
 * 2. Clase existe
 * 3. NO hay inscripción duplicada (mismo usuario + clase)
 * 4. Hay cupos disponibles
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("InscripcionService - Tests Unitarios")
public class InscripcionServiceTest {

    @Mock
    private InscripcionRepository inscripcionRepository;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private ClaseService claseService;

    @InjectMocks
    private InscripcionService inscripcionService;

    private InscripcionDTO validInscripcionDTO;
    private Inscripcion mockInscripcion;

    @BeforeEach
    void setUp() {
        // DTO válido para usar en tests
        validInscripcionDTO = new InscripcionDTO();
        validInscripcionDTO.setUsuarioId(1);
        validInscripcionDTO.setClaseId(1);
        validInscripcionDTO.setFecha(LocalDate.of(2026, 9, 10));
        validInscripcionDTO.setEstado("activa");

        // Inscripción mock para retornar del save
        mockInscripcion = new Inscripcion();
        mockInscripcion.setId(1);
        mockInscripcion.setUsuarioId(1);
        mockInscripcion.setClaseId(1);
        mockInscripcion.setFecha(LocalDate.of(2026, 9, 10));
        mockInscripcion.setEstado("activa");
    }

    // ==================== TESTS EXITOSOS ====================

    @Test
    @DisplayName("✅ Crear inscripción exitosa con todos los datos válidos")
    void crearInscripcionExitosa() {
        // Arrange
        doNothing().when(usuarioService).verificarUsuarioExiste(1);
        when(claseService.obtenerClase(1)).thenReturn(createMockClase());
        when(claseService.obtenerCuposDisponibles(1)).thenReturn(10); // 10 cupos disponibles
        when(inscripcionRepository.findAll()).thenReturn(List.of()); // No hay inscripciones existentes
        when(inscripcionRepository.save(any(Inscripcion.class))).thenReturn(mockInscripcion);

        // Act
        Inscripcion resultado = inscripcionService.crearInscripcion(validInscripcionDTO);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getId());
        assertEquals(1, resultado.getUsuarioId());
        assertEquals(1, resultado.getClaseId());
        assertEquals("activa", resultado.getEstado());
        verify(usuarioService).verificarUsuarioExiste(1);
        verify(claseService).obtenerClase(1);
        verify(inscripcionRepository).save(any(Inscripcion.class));
    }

    @Test
    @DisplayName("✅ Obtener inscripción existente por ID")
    void obtenerInscripcionExistente() {
        // Arrange
        when(inscripcionRepository.findById(1)).thenReturn(Optional.of(mockInscripcion));

        // Act
        Inscripcion resultado = inscripcionService.obtenerInscripcion(1);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getId());
        verify(inscripcionRepository).findById(1);
    }

    @Test
    @DisplayName("✅ Cancelar inscripción exitosamente")
    void cancelarInscripcionExitosa() {
        // Arrange
        when(inscripcionRepository.findById(1)).thenReturn(Optional.of(mockInscripcion));
        when(inscripcionRepository.save(any(Inscripcion.class))).thenReturn(mockInscripcion);

        // Act
        Inscripcion resultado = inscripcionService.cancelarInscripcion(1);

        // Assert
        assertEquals("cancelada", resultado.getEstado());
        verify(inscripcionRepository).save(any(Inscripcion.class));
    }

    @Test
    @DisplayName("✅ Listar todas las inscripciones")
    void listarInscripciones() {
        // Arrange
        List<Inscripcion> inscripciones = List.of(mockInscripcion);
        when(inscripcionRepository.findAll()).thenReturn(inscripciones);

        // Act
        List<Inscripcion> resultado = inscripcionService.listarInscripciones();

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(inscripcionRepository).findAll();
    }

    // ==================== TESTS DE ERROR - VALIDACIÓN 1 ====================

    @Test
    @DisplayName("❌ VALIDACIÓN 1: Usuario NO existe")
    void crearInscripcionUsuarioNoExiste() {
        // Arrange
        doThrow(new ResourceNotFoundException("Usuario con ID 999 no encontrado"))
                .when(usuarioService).verificarUsuarioExiste(999);

        InscripcionDTO dtoConUsuarioInvalido = new InscripcionDTO();
        dtoConUsuarioInvalido.setUsuarioId(999);
        dtoConUsuarioInvalido.setClaseId(1);
        dtoConUsuarioInvalido.setFecha(LocalDate.of(2026, 9, 10));
        dtoConUsuarioInvalido.setEstado("activa");

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            inscripcionService.crearInscripcion(dtoConUsuarioInvalido);
        });

        verify(usuarioService).verificarUsuarioExiste(999);
        verify(inscripcionRepository, never()).save(any());
    }

    // ==================== TESTS DE ERROR - VALIDACIÓN 2 ====================

    @Test
    @DisplayName("❌ VALIDACIÓN 2: Clase NO existe")
    void crearInscripcionClaseNoExiste() {
        // Arrange
        doNothing().when(usuarioService).verificarUsuarioExiste(1);
        when(claseService.obtenerClase(999))
                .thenThrow(new ResourceNotFoundException("Clase con ID 999 no encontrada"));

        InscripcionDTO dtoConClaseInvalida = new InscripcionDTO();
        dtoConClaseInvalida.setUsuarioId(1);
        dtoConClaseInvalida.setClaseId(999);
        dtoConClaseInvalida.setFecha(LocalDate.of(2026, 9, 10));
        dtoConClaseInvalida.setEstado("activa");

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            inscripcionService.crearInscripcion(dtoConClaseInvalida);
        });

        verify(claseService).obtenerClase(999);
        verify(inscripcionRepository, never()).save(any());
    }

    // ==================== TESTS DE ERROR - VALIDACIÓN 3 ====================

    @Test
    @DisplayName("❌ VALIDACIÓN 3: Inscripción duplicada - usuario ya en clase")
    void crearInscripcionDuplicada() {
        // Arrange: Usuario ya está inscrito
        Inscripcion inscripcionExistente = new Inscripcion();
        inscripcionExistente.setUsuarioId(1);
        inscripcionExistente.setClaseId(1);
        inscripcionExistente.setEstado("activa");

        doNothing().when(usuarioService).verificarUsuarioExiste(1);
        when(claseService.obtenerClase(1)).thenReturn(createMockClase());
        when(inscripcionRepository.findAll()).thenReturn(List.of(inscripcionExistente));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            inscripcionService.crearInscripcion(validInscripcionDTO);
        });

        verify(inscripcionRepository, never()).save(any());
    }

    @Test
    @DisplayName("✅ NO hay duplicada - inscripción anterior CANCELADA")
    void crearInscripcionCancelada() {
        // Arrange: Inscripción anterior está CANCELADA
        Inscripcion inscripcionCancelada = new Inscripcion();
        inscripcionCancelada.setUsuarioId(1);
        inscripcionCancelada.setClaseId(1);
        inscripcionCancelada.setEstado("cancelada"); // CANCELADA

        doNothing().when(usuarioService).verificarUsuarioExiste(1);
        when(claseService.obtenerClase(1)).thenReturn(createMockClase());
        when(claseService.obtenerCuposDisponibles(1)).thenReturn(10); // 10 cupos disponibles
        when(inscripcionRepository.findAll()).thenReturn(List.of(inscripcionCancelada));
        when(inscripcionRepository.save(any(Inscripcion.class))).thenReturn(mockInscripcion);

        // Act
        Inscripcion resultado = inscripcionService.crearInscripcion(validInscripcionDTO);

        // Assert
        assertNotNull(resultado);
        verify(inscripcionRepository).save(any(Inscripcion.class));
    }

    @Test
    @DisplayName("✅ NO hay duplicada - es usuario diferente en MISMA clase")
    void crearInscripcionUsuarioDiferente() {
        // Arrange: Otro usuario está en la misma clase
        Inscripcion inscripcionOtroUsuario = new Inscripcion();
        inscripcionOtroUsuario.setUsuarioId(2); // Diferente usuario
        inscripcionOtroUsuario.setClaseId(1);
        inscripcionOtroUsuario.setEstado("activa");

        doNothing().when(usuarioService).verificarUsuarioExiste(1);
        when(claseService.obtenerClase(1)).thenReturn(createMockClase());
        when(claseService.obtenerCuposDisponibles(1)).thenReturn(10); // 10 cupos disponibles
        when(inscripcionRepository.findAll()).thenReturn(List.of(inscripcionOtroUsuario));
        when(inscripcionRepository.save(any(Inscripcion.class))).thenReturn(mockInscripcion);

        // Act
        Inscripcion resultado = inscripcionService.crearInscripcion(validInscripcionDTO);

        // Assert
        assertNotNull(resultado);
        verify(inscripcionRepository).save(any(Inscripcion.class));
    }

    // ==================== TESTS DE ERROR - VALIDACIÓN 4 ====================

    @Test
    @DisplayName("❌ VALIDACIÓN 4: No hay cupos disponibles")
    void crearInscripcionSinCupos() {
        // Arrange: Clase con 1 cupo
        doNothing().when(usuarioService).verificarUsuarioExiste(1);
        when(claseService.obtenerClase(1)).thenReturn(createMockClase()); // 1 cupo
        when(claseService.obtenerCuposDisponibles(1)).thenReturn(1);

        // Ya hay 1 inscripción activa
        Inscripcion inscripcionExistente = new Inscripcion();
        inscripcionExistente.setUsuarioId(2);
        inscripcionExistente.setClaseId(1);
        inscripcionExistente.setEstado("activa");

        when(inscripcionRepository.findAll()).thenReturn(List.of(inscripcionExistente));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            inscripcionService.crearInscripcion(validInscripcionDTO);
        });

        verify(inscripcionRepository, never()).save(any());
    }

    @Test
    @DisplayName("✅ VALIDACIÓN 4: Hay cupos disponibles")
    void crearInscripcionConCupos() {
        // Arrange: Clase con 2 cupos
        doNothing().when(usuarioService).verificarUsuarioExiste(1);
        when(claseService.obtenerClase(1)).thenReturn(createMockClase()); // 1 cupo
        when(claseService.obtenerCuposDisponibles(1)).thenReturn(2); // 2 cupos

        // Ya hay 1 inscripción activa
        Inscripcion inscripcionExistente = new Inscripcion();
        inscripcionExistente.setUsuarioId(2);
        inscripcionExistente.setClaseId(1);
        inscripcionExistente.setEstado("activa");

        when(inscripcionRepository.findAll()).thenReturn(List.of(inscripcionExistente));
        when(inscripcionRepository.save(any(Inscripcion.class))).thenReturn(mockInscripcion);

        // Act
        Inscripcion resultado = inscripcionService.crearInscripcion(validInscripcionDTO);

        // Assert
        assertNotNull(resultado);
        verify(inscripcionRepository).save(any(Inscripcion.class));
    }

    @Test
    @DisplayName("✅ VALIDACIÓN 4: Hay cupos disponibles (2/3)")
    void crearInscripcionConCuposMultiples() {
        // Arrange: Clase con 3 cupos
        doNothing().when(usuarioService).verificarUsuarioExiste(1);
        when(claseService.obtenerClase(1)).thenReturn(createMockClase());
        when(claseService.obtenerCuposDisponibles(1)).thenReturn(3);

        // Ya hay 2 inscripciones activas
        Inscripcion inscripcion1 = new Inscripcion();
        inscripcion1.setUsuarioId(2);
        inscripcion1.setClaseId(1);
        inscripcion1.setEstado("activa");

        Inscripcion inscripcion2 = new Inscripcion();
        inscripcion2.setUsuarioId(3);
        inscripcion2.setClaseId(1);
        inscripcion2.setEstado("activa");

        when(inscripcionRepository.findAll()).thenReturn(List.of(inscripcion1, inscripcion2));
        when(inscripcionRepository.save(any(Inscripcion.class))).thenReturn(mockInscripcion);

        // Act
        Inscripcion resultado = inscripcionService.crearInscripcion(validInscripcionDTO);

        // Assert
        assertNotNull(resultado);
        verify(inscripcionRepository).save(any(Inscripcion.class));
    }

    // ==================== HELPER METHODS ====================

    private com.sportcourt.backend.model.Clase createMockClase() {
        com.sportcourt.backend.model.Clase clase = new com.sportcourt.backend.model.Clase();
        clase.setId(1);
        clase.setSlots(1);
        return clase;
    }
}
