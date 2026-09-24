# =========================
# Etapa 1: Construcción
# =========================
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY . .

RUN chmod +x mvnw

RUN ./mvnw clean package -DskipTests


# =========================
# Etapa 2: Ejecución
# =========================
FROM eclipse-temurin:21-jre-alpine

# Actualizar paquetes del sistema a versiones con parches de seguridad
RUN apk update && apk upgrade

WORKDIR /app

# Crear usuario no privilegiado para ejecutar la aplicación
RUN addgroup -S spring && adduser -S -u 1001 -G spring spring

COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]