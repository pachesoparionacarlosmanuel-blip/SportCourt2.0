# Guía de Deployment — SportCourt 2.0

Esta guía cubre cómo llevar SportCourt 2.0 de un entorno local a un servidor real.
Sigue las reglas de [AGENTS.md](../AGENTS.md): MySQL es la fuente de verdad, no se
crean bases de datos nuevas y ningún cambio destructivo se hace sin autorización.

## 1. Requisitos del servidor

- Java 21 (JRE es suficiente para ejecutar el `.jar`)
- MySQL 8+ accesible desde el servidor del backend
- Node.js 20+ (solo en la máquina donde se compile el CSS, no hace falta en producción)
- Un servidor de archivos estáticos para el frontend (Nginx, Apache, o cualquier hosting estático)

## 2. Base de datos

El backend corre con `spring.jpa.hibernate.ddl-auto=none`: **nunca crea ni modifica tablas
automáticamente**. La base de datos `sportcourt` debe existir de antemano con la
estructura esperada.

Referencia del esquema, derivado directamente de las entidades JPA en
`backend/src/main/java/com/sportcourt/backend/model/` (no es un script para ejecutar
a ciegas — valida cada tabla contra tu base real antes de usarlo en un entorno nuevo):

```sql
CREATE TABLE usuarios (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  nombre   VARCHAR(255),
  email    VARCHAR(255),
  password VARCHAR(255),
  rol      VARCHAR(255)
);

CREATE TABLE cancha (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tipo        VARCHAR(255),  -- sport
  nombre      VARCHAR(255),  -- name
  ubicacion   VARCHAR(255),  -- location
  precio      DOUBLE,        -- price
  estado      VARCHAR(255),  -- status
  descripcion VARCHAR(255),  -- description
  capacidad   INT,           -- capacity
  imagen      VARCHAR(255)   -- image
);

CREATE TABLE clase (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  nombre   VARCHAR(255),  -- name
  icono    VARCHAR(255),  -- icon
  nivel    VARCHAR(255),  -- level
  horario  VARCHAR(255),  -- schedule
  profesor VARCHAR(255),  -- professor
  precio   DOUBLE,        -- price
  cupos    INT            -- slots
);

CREATE TABLE reserva (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT,
  cancha_id    INT,
  fecha        DATE,
  hora_inicio  TIME,
  hora_fin     TIME,
  estado       VARCHAR(255)
);

CREATE TABLE inscripcion (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  clase_id   INT,
  fecha      DATE,
  estado     VARCHAR(255)
);
```

Crea un usuario de MySQL con permisos solo sobre la base `sportcourt` (no uses el
usuario root de MySQL en el backend).

## 3. Variables de entorno de producción

El backend nunca lleva credenciales en el código. Configura estas variables en el
entorno donde corra el `.jar` (systemd, Docker, panel del hosting, etc.):

| Variable | Valor en producción |
|---|---|
| `DB_URL` | `jdbc:mysql://<host-mysql>:3306/sportcourt` |
| `DB_USERNAME` | usuario de MySQL con acceso solo a `sportcourt` |
| `DB_PASSWORD` | contraseña real (nunca la del `.env.example`) |
| `SERVER_PORT` | puerto interno del backend (por defecto `8080`) |

## 4. Build y ejecución del backend

### Ejecución local

```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar