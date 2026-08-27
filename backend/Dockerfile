# ---- Stage 1: Build ----
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copia solo il pom.xml prima, per sfruttare la cache Docker sulle dipendenze
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia il resto del codice sorgente e compila
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Stage 2: Run ----
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copia solo il jar compilato dallo stage precedente (immagine finale molto più leggera)
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
