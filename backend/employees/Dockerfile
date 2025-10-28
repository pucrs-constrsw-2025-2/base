FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY src ./src

# Install Maven and curl (curl needed for healthcheck)
RUN apt-get update && apt-get install -y maven curl && rm -rf /var/lib/apt/lists/*

# Build the application
RUN mvn clean package -DskipTests

# Run the application
EXPOSE 8080
CMD ["java", "-jar", "target/employees-api-1.0.0.jar"]






