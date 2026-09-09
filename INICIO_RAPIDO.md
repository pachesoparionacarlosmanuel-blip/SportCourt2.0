# 🚀 INICIO RÁPIDO: Fase 1 Completada

## ✅ Lo que se hizo

Se implementaron **3 mejoras críticas de seguridad** en SportCourt 2.0:

1. **🔐 Credenciales Protegidas** → Variables de entorno
2. **🔒 Autenticación Segura** → BCrypt para contraseñas
3. **🛡️ CORS Restringido** → Solo localhost

El proyecto **compila correctamente** ✅

---

## 📖 Documentación

Lee estos archivos para entender los cambios:

1. **`RESUMEN_FASE1.md`** ← Comienza aquí (resumen de cambios)
2. **`FASE1_SEGURIDAD.md`** ← Detalles técnicos

---

## ⚙️ Ejecutar el Proyecto

### Desarrollo Local

```bash
cd backend/
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Credenciales de desarrollo (en `application-dev.properties`):
- **Usuario:** `sportcourt`
- **Contraseña:** `SportCourt123`
- **Host:** `localhost:3306`

### Producción

Establecer variables de entorno:

```bash
export DB_URL=jdbc:mysql://prod-server:3306/sportcourt
export DB_USERNAME=sportcourt_prod
export DB_PASSWORD=<contraseña-segura>
export ADMIN_USER=admin
export ADMIN_PASSWORD=<contraseña-admin-segura>
```

Luego ejecutar:

```bash
./mvnw spring-boot:run
```

---

## ⚠️ TAREA CRÍTICA PENDIENTE

**Migrar contraseñas a BCrypt**

Las contraseñas actuales en MySQL están en texto plano. Necesitan convertirse a BCrypt.

### Opción Rápida (Herramienta Online)

1. Ir a: https://bcrypt-generator.com/
2. Ingresar contraseña: `SportCourt123`
3. Generar hash
4. Ejecutar SQL:

```sql
UPDATE usuarios SET password = '<hash-generado>' WHERE id = 1;
```

### Opción Recomendada (Script)

Próxima fase creará un script automático de migración.

---

## 🧪 Verificación

### ¿El proyecto compila?

```bash
cd backend/
./mvnw clean compile
# Debe mostrar: BUILD SUCCESS
```

### ¿Puedo ejecutar el servidor?

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
# Debe mostrar: "Started BackendApplication"
```

### ¿Puedo hacer login?

Después de migrar contraseñas a BCrypt:

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"SportCourt123"}'
```

Respuesta esperada:
```json
{
  "id": 1,
  "nombre": "Admin",
  "email": "admin@test.com",
  "rol": "administrador"
}
```

Note: **No retorna la contraseña** (SEGURO ✅)

---

## 📊 Archivos Nuevos/Modificados

### Nuevos (7 archivos)
- ✅ `backend/src/main/java/com/sportcourt/backend/config/CorsConfig.java`
- ✅ `backend/src/main/java/com/sportcourt/backend/config/SecurityConfig.java`
- ✅ `backend/src/main/java/com/sportcourt/backend/service/AuthService.java`
- ✅ `backend/src/main/java/com/sportcourt/backend/dto/LoginRequest.java`
- ✅ `backend/src/main/java/com/sportcourt/backend/dto/LoginResponse.java`
- ✅ `backend/src/main/resources/application-dev.properties`
- ✅ `backend/.env.example`

### Modificados (6 archivos)
- ✅ `backend/pom.xml` (agregada Spring Security)
- ✅ `backend/src/main/resources/application.properties` (variables de entorno)
- ✅ `backend/src/main/java/com/sportcourt/backend/controller/LoginController.java`
- ✅ `backend/src/main/java/com/sportcourt/backend/controller/CanchaController.java`
- ✅ `backend/src/main/java/com/sportcourt/backend/controller/ClaseController.java`
- ✅ `backend/src/main/java/com/sportcourt/backend/controller/ReservaController.java`
- ✅ `backend/src/main/java/com/sportcourt/backend/controller/InscripcionController.java`
- ✅ `backend/src/main/java/com/sportcourt/backend/controller/UsuarioController.java`

---

## ❓ Preguntas Frecuentes

**P: ¿Ahora necesito cambiar el Frontend?**
R: Sí. El nuevo endpoint de login retorna JSON sin contraseña. Actualizar en Fase 2.

**P: ¿Cómo genero un hash BCrypt?**
R: Online: bcrypt-generator.com o con Spring: `new BCryptPasswordEncoder().encode("password")`

**P: ¿Mi base de datos está segura ahora?**
R: ✅ Credenciales protegidas y contraseñas no se guardan en texto plano (después de migración).

**P: ¿Puedo usar esto en producción?**
R: Casi. Falta:
   - Migrar contraseñas a BCrypt
   - Cambiar CORS a tu dominio real
   - Usar variables de entorno seguras (AWS Secrets, Azure Key Vault, etc.)

---

## 🎯 Próximo Paso

**¿Autorizo para continuar con Fase 2?**

Fase 2 incluirá:
- ✅ Validaciones en todos los endpoints
- ✅ DTOs para todas las entidades
- ✅ Manejo de errores HTTP mejorado
- ✅ Mensajes de error descriptivos

---

**Status:** 🟢 FASE 1 COMPLETADA
**Compilación:** ✅ BUILD SUCCESS
**Documentación:** ✅ LISTA

¿Continuamos? 🚀
