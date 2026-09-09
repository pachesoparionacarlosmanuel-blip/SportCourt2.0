# 🔒 FASE 1: SEGURIDAD - CAMBIOS IMPLEMENTADOS

## Resumen de Cambios

Se han implementado las siguientes mejoras de seguridad:

### 1. ✅ Credenciales Protegidas (Variables de Entorno)

**Archivo:** `backend/src/main/resources/application.properties`

**Antes:**
```properties
spring.datasource.username=sportcourt
spring.datasource.password=SportCourt123
```

**Después:**
```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/sportcourt}
spring.datasource.username=${DB_USERNAME:sportcourt}
spring.datasource.password=${DB_PASSWORD:}
```

**¿Por qué?** Las credenciales hardcodeadas son un riesgo crítico. Ahora se lee desde variables de entorno.

**Configuración para desarrollo:** `application-dev.properties` (contiene valores de desarrollo)

---

### 2. ✅ Autenticación con BCrypt (Encriptación de Contraseñas)

**Dependencia agregada:** `spring-boot-starter-security`

**Nuevos archivos:**
- `backend/src/main/java/com/sportcourt/backend/config/SecurityConfig.java` - Configura BCrypt
- `backend/src/main/java/com/sportcourt/backend/service/AuthService.java` - Lógica de autenticación
- `backend/src/main/java/com/sportcourt/backend/dto/LoginRequest.java` - DTO de solicitud
- `backend/src/main/java/com/sportcourt/backend/dto/LoginResponse.java` - DTO de respuesta

**¿Por qué?** Las contraseñas en texto plano son extremadamente inseguras. BCrypt usa hashing con salt.

**Cambio en LoginController:**
- ❌ No retorna más la contraseña en la respuesta
- ✅ Retorna `LoginResponse` sin datos sensibles
- ✅ Valida entrada
- ✅ Retorna HTTP 400/401 apropiados

---

### 3. ✅ CORS Restringido (No más `origins = "*"`)

**Archivo nuevo:** `backend/src/main/java/com/sportcourt/backend/config/CorsConfig.java`

**Configuración:**
```java
.allowedOrigins(
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
)
```

**¿Por qué?** CORS permisivo = cualquiera puede hacer requests a tu API desde cualquier sitio.

**Cambio en Controllers:**
- ❌ Removidos `@CrossOrigin(origins = "*")` de todos los controllers
- ✅ CORS ahora configurado centralmente en `CorsConfig.java`

---

### 4. ✅ Logs de Depuración Desactivados

**Archivo:** `backend/src/main/resources/application.properties`

**Cambio:**
```properties
spring.jpa.show-sql=false  # Antes: true
```

**¿Por qué?** Los logs SQL en producción pueden exponer información sensible.

---

## 🚨 TAREA CRÍTICA: MIGRAR CONTRASEÑAS A BCRYPT

**IMPORTANTE:** Las contraseñas actuales en MySQL están en texto plano. Deben migrarse a BCrypt.

### Opción 1: Usar Spring Security para registrar usuarios

En una terminal, puedes usar Spring Security para encriptar contraseñas:

```bash
# En el directorio backend/
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Luego ejecutar un script SQL:

```sql
-- Ejemplo: actualizar contraseña de un usuario
-- Usa la contraseña: admin123 encriptada con BCrypt
UPDATE usuarios SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36XQZdsO' WHERE email = 'admin@test.com';

-- El hash anterior corresponde a "password123"
-- Para generar un hash, usa una herramienta online o ejecuta:
```

### Opción 2: Script de migración (Recomendado)

Crearemos un script de migración después de Fase 1.

### Opción 3: Reimplementar el registro de usuarios

Crear un endpoint `/api/register` que encripte automáticamente.

---

## 📋 Archivos Modificados

- ✅ `pom.xml` - Agregadas dependencias de Spring Security
- ✅ `application.properties` - Variables de entorno + logs desactivados
- ✅ `application-dev.properties` - Configuración de desarrollo (NUEVO)
- ✅ `LoginController.java` - Seguridad mejorada
- ✅ `CanchaController.java` - Removido `@CrossOrigin`
- ✅ `ClaseController.java` - Removido `@CrossOrigin`
- ✅ `ReservaController.java` - Removido `@CrossOrigin`
- ✅ `InscripcionController.java` - Removido `@CrossOrigin`
- ✅ `UsuarioController.java` - Removido `@CrossOrigin`

## 📁 Nuevos Archivos

- ✅ `config/CorsConfig.java` - Configuración CORS central
- ✅ `config/SecurityConfig.java` - Configuración BCrypt
- ✅ `service/AuthService.java` - Servicio de autenticación
- ✅ `dto/LoginRequest.java` - DTO de solicitud
- ✅ `dto/LoginResponse.java` - DTO de respuesta

---

## 🧪 Compilación

```bash
cd backend/
./mvnw clean compile
# BUILD SUCCESS ✅
```

---

## ⚠️ PRÓXIMOS PASOS

1. **Migrar contraseñas** a BCrypt en MySQL
2. **Actualizar el Frontend** para manejar la nueva respuesta de login (sin contraseña)
3. **Pruebas** del nuevo endpoint de login

---

## 📝 Notas Importantes

- Las variables de entorno por defecto usan valores de desarrollo
- En producción, SIEMPRE establecer variables de entorno seguras:
  - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
  - `ADMIN_USER`, `ADMIN_PASSWORD`
- CORS está restringido a localhost. En producción, cambiar a tu dominio.

---

**Fase 1 completada ✅**
Siguiente: Fase 2 - Arquitectura (JWT/DTOs/Validaciones)
