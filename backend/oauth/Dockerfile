FROM openjdk:21-jdk-slim

WORKDIR /app

# Copiar o arquivo JAR da aplicação
COPY target/constrsw-0.0.1-SNAPSHOT.jar app.jar

# Expor a porta da aplicação
EXPOSE 8082

# Comando para executar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
