FROM openjdk:21-jdk-slim AS build

WORKDIR /app

# Copiar os arquivos do projeto para o container
COPY . .

# Instalar o Maven e construir o JAR
RUN apt-get update && \
    apt-get install -y maven && \
    mvn clean package -DskipTests

FROM openjdk:21-jdk-slim

WORKDIR /app

# Copiar o JAR gerado da etapa de build
COPY --from=build /app/target/constrsw-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
