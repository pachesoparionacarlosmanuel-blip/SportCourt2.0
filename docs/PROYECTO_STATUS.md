# SportCourt 2.0 - Estado del Proyecto

**Última Actualización:** 2026-09-13  
**Compilación Actual:** BUILD SUCCESS ✅

---

## 📊 Estado por Fases

```
┌────────────────────────────────────────────────────────────────┐
│ FASE 1: SEGURIDAD                                              │
│ ✅ COMPLETADA                                                  │
│                                                                │
│ - ✅ BCrypt password encoder (strength 10)                     │
│ - ✅ Credenciales en variables de entorno                      │
│ - ✅ CORS configurado (localhost only)                         │
│ - ✅ Logging SQL deshabilitado                                 │
│ - ✅ AuthService para verificación segura                      │
│ - ✅ LoginResponse sin contraseña                              │
│                                                                │
│ Compilación: 18.671 segundos                                   │
│ Archivos modificados: 9                                        │
│ Líneas añadidas: 267                                           │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ FASE 2: ARQUITECTURA                                           │
│ ✅ COMPLETADA                                                  │
│                                                                │
│ - ✅ 6 DTOs con validación (CanchaDTO, ClaseDTO, etc)         │
│ - ✅ GlobalExceptionHandler centralizado                       │
│ - ✅ ErrorResponse estandarizado                               │
│ - ✅ Todos los controladores con @Valid                        │
│ - ✅ UsuarioDTO sin exponer contraseña                         │
│ - ✅ Códigos HTTP correctos (201, 204, 400, 404, 409)         │
│                                                                │
│ Compilación: 6.441 segundos                                    │
│ Archivos creados: 7                                            │
│ Archivos modificados: 5                                        │
│ Líneas añadidas: 421                                           │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ FASE 3: LÓGICA DE NEGOCIO (Service Layer)                     │
│ ✅ COMPLETADA                                                  │
│                                                                │
│ Servicios Creados:                                             │
│ - ✅ UsuarioService (búsqueda y validación)                    │
│ - ✅ CanchaService (CRUD + capacidad)                          │
│ - ✅ ClaseService (CRUD + cupos)                               │
│ - ✅ ReservaService ⭐ (5 validaciones críticas)               │
│ - ✅ InscripcionService ⭐ (4 validaciones críticas)           │
│                                                                │
│ Controladores Actualizados:                                    │
│ - ✅ CanchaController (usa CanchaService)                      │
│ - ✅ ClaseController (usa ClaseService)                        │
│ - ✅ ReservaController (usa ReservaService)                    │
│ - ✅ InscripcionController (usa InscripcionService)            │
│ - ✅ UsuarioController (usa UsuarioService)                    │
│                                                                │
│ Compilación: 6.080 segundos                                    │
│ Archivos creados: 5                                            │
│ Archivos modificados: 5                                        │
│ Líneas añadidas: 583                                           │
│ Errores corregidos: 3 (tipos LocalTime)                        │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ FASE 4: TESTING Y VALIDACIÓN                                  │
│ ✅ COMPLETADA (unit tests) + CI corriéndolos en cada push      │
│                                                                │
│ - ✅ 65 tests (JUnit 5 + Mockito + 1 @SpringBootTest), 0 fallos│
│ - ✅ Pruebas de duplicados y superposición de horarios         │
│ - ✅ Pruebas de capacidad/cupos                                │
│ - ✅ Pruebas de autorización por propietario (Reserva)         │
│ - ✅ BackendApplicationTests corre con H2 en memoria (perfil   │
│   "test"), sin depender de la MySQL real — apto para CI       │
│ - ✅ GitHub Actions ejecuta "mvn test" en cada push/PR         │
│   (job "validar-backend" en validar-proyecto.yml)              │
│                                                                │
│ Ver detalle en FASE4_TESTING.md                                │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ FASE 1B: ENDURECIMIENTO DE SEGURIDAD (post-Fase 1)             │
│ ✅ COMPLETADA — 2026-09-13                                     │
│                                                                │
│ - ✅ Protección CSRF con cookie token (`/api/csrf`)            │
│ - ✅ Autorización por propietario en /api/reservas/{id}        │
│   (un usuario solo ve/cancela sus propias reservas; ADMIN      │
│   puede ver todas)                                             │
│ - ✅ Autorización por rol reforzada en SecurityConfig          │
│   (ADMIN vs autenticado, por método HTTP)                      │
│ - ✅ UsuarioService.obtenerUsuarioPorEmail para resolver al     │
│   usuario autenticado desde el contexto de seguridad           │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ FASE 5: FRONTEND                                               │
│ ✅ COMPLETADA (código) — ⏳ pendiente verificación E2E con      │
│    MySQL real (sin acceso a DB_USERNAME/DB_PASSWORD locales)    │
│                                                                │
│ - ✅ Eliminados todos los console.log de assets/js/app.js       │
│ - ✅ Helper parseApiError: muestra el message real del         │
│   ErrorResponse del backend (400/404/409) en vez del código    │
│   HTTP genérico, en reservas, cancelaciones, inscripciones y   │
│   CRUD del panel admin                                         │
│ - ✅ Helper asArray: valida que las respuestas de la API sean   │
│   arrays antes de usarlas en .map/.find/.some (canchas,        │
│   clases, reservas, inscripciones, usuarios)                   │
│ - ✅ Revisados los 6 DTOs del backend (Cancha, Clase, Reserva,  │
│   Inscripcion, Usuario, LoginResponse) contra su uso en el     │
│   frontend                                                      │
│ - ✅ Bug corregido: al guardar/eliminar una clase en el panel   │
│   admin, el código leía/escribía campos en español             │
│   (nombre/nivel/horario/precio/cupos) que no existen en        │
│   ClaseDTO (name/level/schedule/price/slots) → mostraba        │
│   nombre y precio en blanco o NaN. Unificado en                │
│   mapClaseDesdeAPI()                                           │
│ - ✅ Bug corregido: el formulario de reserva mostraba "Reserva  │
│   confirmada" sin esperar la respuesta del backend, incluso    │
│   si fallaba (p. ej. 409 por horario duplicado)                │
│ - ✅ localStorage ya no se usa como fuente de verdad de datos   │
│   de negocio: eliminados DEFAULT_COURTS, SEED_COURTS,          │
│   SEED_CLASSES, loadData/saveData; canchas y clases del panel  │
│   admin ahora solo vienen de MySQL vía la API                  │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ FASE 6: DOCUMENTACIÓN FINAL                                    │
│ ✅ COMPLETADA — 2026-09-13                                     │
│                                                                │
│ - ✅ OpenAPI/Swagger: springdoc-openapi 3.1.1 agregado,         │
│   /v3/api-docs y /swagger-ui/index.html habilitados y          │
│   permitidos en SecurityConfig; verificado en vivo (200 OK)    │
│   con perfil test (H2), 7 controladores con @Tag               │
│ - ✅ README.md (raíz): arquitectura, stack, setup, cómo correr  │
│   backend/frontend, tests, link a Swagger, roles del sistema   │
│ - ✅ docs/DEPLOYMENT.md: esquema de referencia de MySQL, vars   │
│   de entorno de producción, build/ejecución, checklist de      │
│   seguridad, ajustes localhost→dominio real pendientes de      │
│   autorización                                                  │
│ - ✅ docs/MANUAL_USUARIO.md: guía funcional por rol (Visitante, │
│   Usuario, Administrador) y mensajes de error comunes           │
└────────────────────────────────────────────────────────────────┘
```

---

## 📈 Métricas Generales

| Métrica | Valor |
|---------|-------|
| **Archivos Java (main)** | 38 |
| **Archivos Java (test)** | 6 |
| **Tests (unit + contexto Spring)** | 65 (0 fallos), corren en CI |
| **Servicios implementados** | 5 |
| **Validaciones críticas** | 9 |
| **Controladores actualizados** | 5 |
| **DTOs creados** | 6 |
| **Excepciones personalizadas** | 2 |

---

## 🏗️ Arquitectura Actual

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTE HTTP                          │
│              (Frontend HTML/JS/Tailwind)                │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   REST API GATEWAY                      │
│              (Spring Boot 4.1.1, Java 21)               │
└─────────────────────────────────────────────────────────┘
              ↓                 ↓               ↓
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Controllers │  │  Validación  │  │ Exception    │
    │  (5)         │  │  de DTOs     │  │ Handler      │
    │              │  │  (@Valid)    │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
              ↓
    ┌────────────────────────────────┐
    │     SERVICE LAYER              │
    │  (Lógica de Negocio)           │
    │                                │
    │  UsuarioService ⌈─────┐        │
    │  CanchaService  │     ├─→ GlobalExceptionHandler
    │  ClaseService   │     │  ├─ 400 BAD_REQUEST
    │  ReservaService ⭐ 9  │  ├─ 404 NOT_FOUND  
    │  InscripcionService ⭐ │  └─ 409 CONFLICT
    │                    ⌞─────┘   
    │                                │
    └────────────────────────────────┘
              ↓
    ┌────────────────────────────────┐
    │   REPOSITORY LAYER             │
    │   (Spring Data JPA)            │
    └────────────────────────────────┘
              ↓
    ┌────────────────────────────────┐
    │      MYSQL (sportcourt)        │
    │                                │
    │ usuarios | canchas | clases    │
    │ reservas | inscripciones       │
    └────────────────────────────────┘
```

---

## 🔐 Seguridad Implementada

| Aspecto | Estado | Detalle |
|--------|--------|---------|
| **Contraseñas** | ✅ BCrypt | Strength 10, nunca en respuestas |
| **Credenciales BD** | ✅ Vars.Env | Sin default, obligatorias (`DB_USERNAME`/`DB_PASSWORD`) |
| **CORS** | ✅ Restringido | localhost:5500 / 127.0.0.1:5500 |
| **CSRF** | ✅ Cookie token | Endpoint `/api/csrf`, `CookieCsrfTokenRepository` |
| **Autorización por rol** | ✅ SecurityConfig | ADMIN vs autenticado, por ruta y método HTTP |
| **Autorización por propietario** | ✅ ReservaController | Usuario solo accede a sus propias reservas (ADMIN ve todas) |
| **Input Validation** | ✅ DTOs | @NotNull, @Email, @Size, etc. |
| **SQL Logging** | ✅ Deshabilitado | No expone queries |
| **Error Handling** | ✅ Genérico | No expone detalles técnicos |
| **API Responses** | ✅ Seguras | Nunca passwords en responses |

---

## 📋 Validaciones Críticas Implementadas

### ReservaService

```
✅ 1. Usuario existe → ResourceNotFoundException (404)
✅ 2. Cancha existe → ResourceNotFoundException (404)  
✅ 3. Horarios válidos → BusinessException (409)
✅ 4. NO hay duplicados → BusinessException (409)
✅ 5. Capacidad disponible → BusinessException (409)
```

**Lógica de Duplicado:** Usuario intenta 2da reserva en MISMA cancha, MISMA fecha, con horas QUE SE SUPERPONEN

### InscripcionService

```
✅ 1. Usuario existe → ResourceNotFoundException (404)
✅ 2. Clase existe → ResourceNotFoundException (404)
✅ 3. NO hay duplicada → BusinessException (409)
✅ 4. Hay cupos → BusinessException (409)
```

---

## 🐛 Issues Detectados y Resueltos

| Issue | Fase | Solución | Status |
|-------|------|----------|--------|
| Credenciales hardcodeadas | 1 | Vars. ambiente | ✅ FIXED |
| Passwords en plain text | 1 | BCrypt encoder | ✅ FIXED |
| CORS abierto a cualquiera | 1 | Whitelist localhost | ✅ FIXED |
| Sin validación de inputs | 2 | DTOs + @Valid | ✅ FIXED |
| Passwords en respuestas API | 2 | LoginResponse, UsuarioDTO sin password | ✅ FIXED |
| Errores inconsistentes | 2 | GlobalExceptionHandler | ✅ FIXED |
| Sin lógica de negocio | 3 | Service Layer | ✅ FIXED |
| Sin validación de duplicados | 3 | ReservaService + InscripcionService | ✅ FIXED |
| Sin validación de capacidad | 3 | ReservaService + InscripcionService | ✅ FIXED |
| Tipos de datos inconsistentes | 3 | LocalTime methods | ✅ FIXED |
| Reserva confirmaba éxito sin esperar al backend | 5 | async/await real + parseApiError | ✅ FIXED |
| Mismatch de campos ClaseDTO en panel admin (nombre/nivel vs name/level) | 5 | mapClaseDesdeAPI() unificado | ✅ FIXED |
| localStorage como fuente de verdad de canchas/clases (admin) | 5 | Eliminados SEED_*/loadData/saveData | ✅ FIXED |
| Respuestas de API sin validar forma antes de .map/.find | 5 | Helper asArray() | ✅ FIXED |

---

## 📝 Archivos Clave del Proyecto

### Backend Java
- `backend/src/main/java/com/sportcourt/backend/`
  - `config/` - SecurityConfig, CorsConfig
  - `controller/` - 7 controladores (Cancha, Clase, Csrf, Inscripcion, Login, Reserva, Usuario)
  - `service/` - 5 servicios con lógica de negocio ⭐ + AuthService
  - `model/` - 5 entities JPA
  - `repository/` - 5 repositories
  - `dto/` - 7 DTOs con validación
  - `exception/` - ErrorResponse, ResourceNotFoundException, BusinessException, GlobalExceptionHandler
  - `BackendApplication.java` - Main app
- `backend/src/test/java/com/sportcourt/backend/` - `BackendApplicationTests` (contexto Spring, perfil
  "test" con H2) + `service/` con 5 suites de unit tests (65 tests en total)

### Base de Datos
- `sportcourt` (MySQL)
  - usuarios, canchas, clases, reservas, inscripciones

### Frontend (HTML/CSS/JS)
- `index.html` - Home
- `login.html` - Autenticación
- `canchas.html` - Listado canchas
- `clases.html` - Listado clases
- `reservas.html` - Mis reservas (incluye inscripciones a clases)
- `perfil.html` - Perfil usuario
- `admin.html` - Panel admin

### Configuración
- `pom.xml` - Dependencias Maven (incluye springdoc-openapi 3.1.1)
- `application.properties` - Config BD, logging
- `AGENTS.md` - Reglas del proyecto

### Documentación
- `README.md` - Setup, cómo correr el proyecto, stack, roles
- `docs/DEPLOYMENT.md` - Guía de despliegue a producción
- `docs/MANUAL_USUARIO.md` - Manual funcional por rol
- `http://localhost:8080/swagger-ui/index.html` - API interactiva (backend corriendo)

---

## ⚙️ Configuración de Build

```
Maven Version: wrapper (mvnw)
Java Version: 21
Spring Boot: 4.1.1
Validación: Jakarta Validation
Persistencia: Spring Data JPA
Base de Datos: MySQL
Build Tool: Maven
```

---

## 🎯 Próximas Acciones (Orden Prioritario)

### Fase 4: Testing (pendiente restante)
1. [x] Crear unit tests para UsuarioService
2. [x] Crear unit tests para CanchaService
3. [x] Crear unit tests para ClaseService
4. [x] Crear unit tests para ReservaService (validaciones)
5. [x] Crear unit tests para InscripcionService (validaciones)
6. [ ] Integration tests para endpoints (con base de datos real/H2)

### Fase 5: Frontend
1. [x] Eliminar console.log statements
2. [x] Actualizar llamadas API para nuevos DTOs (y corregir mismatches encontrados)
3. [x] Manejar errores 409 (duplicados, capacidad)
4. [x] Manejar errores 404 (recurso no encontrado)
5. [x] Validación de respuestas
6. [ ] Verificación E2E con backend + MySQL real corriendo (pendiente: acceso a DB_USERNAME/DB_PASSWORD locales)

### Fase 6: Documentación
1. [x] Generar OpenAPI/Swagger
2. [x] Actualizar README
3. [x] Guía de deployment
4. [x] Manual de usuario

---

## 📞 Soporte de Reglas de Negocio

Según AGENTS.md:
- ✅ MySQL es fuente de verdad
- ✅ Backend decide (validaciones en servicios)
- ✅ Frontend presenta
- ✅ Cambios autorizados y controlados
- ✅ Sin cambios destructivos
- ✅ Funcionalidades preservadas

---

## 🚀 Status General

```
SEGURIDAD    ████████████████████ ✅ 100%
ARQUITECTURA ████████████████████ ✅ 100%
LÓGICA NEG.  ████████████████████ ✅ 100%
TESTING      ████████████████░░░░ 🟡  80% (unit ✅ / integración ⏳)
FRONTEND     ██████████████████░░ 🟡  90% (código ✅ / verificación E2E ⏳)
DOCUMENTAC.  ████████████████████ ✅ 100%

Progreso General: ███████████████████░░ 95%
```

**Último BUILD:** 2026-09-13 - BUILD SUCCESS ✅ (65/65 tests, 0 fallos, corre en CI)  
**Frontend:** console.log eliminados, errores 404/409 mostrados con el mensaje real del backend,
respuestas de API validadas antes de usarse, mismatches de DTO en Clase corregidos, localStorage
ya no es fuente de verdad de negocio.  
**Documentación:** OpenAPI/Swagger habilitado y verificado en vivo, README.md, guía de
deployment y manual de usuario creados.  
**Próximo paso:** integration tests de Fase 4 y verificación E2E de Fase 5 contra MySQL real
(ambos bloqueados hoy por falta de acceso a `DB_USERNAME`/`DB_PASSWORD` locales).
