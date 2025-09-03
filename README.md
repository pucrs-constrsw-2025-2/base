# Closed CRAS

Base repository for the Closed CRAS application.

The "Closed CRAS" project is a full-stack, polyglot microservices application. It serves as a foundational template or "base" repository for building a larger system, providing essential infrastructure for development, authentication, and code quality management. The project follows a modern microservices architecture, with a backend composed of independent services designed to support multiple programming languages. The current implementation includes an authentication service written in Rust, and the SonarQube configuration shows examples for Java, Python, and Node.js, highlighting the project's goal to support a polyglot environment.

The system uses Keycloak as a centralized identity and access management (IAM) solution, with a custom OAuth service that integrates with it to handle user management. The project relies on Docker and Docker Compose to containerize and orchestrate all services, including PostgreSQL, Keycloak, and SonarQube, ensuring a consistent development environment. Continuous code quality is a core principle, with SonarQube pre-configured for static analysis to identify bugs, vulnerabilities, and code smells.

## Badges

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![Quality Gate Status](https://img.shields.io/badge/quality-passing-brightgreen)](http://localhost:9000)
[![Coverage](https://img.shields.io/badge/coverage-15%25-brightgreen)](http://localhost:9000)

## Technologies

- **Backend**:
  - **Rust**: Used in the authentication service (OAuth).
  - **Keycloak**: For identity and access management.
  - **PostgreSQL**: Relational database.
- **DevOps & Tools**:
  - **Docker & Docker Compose**: For containerization and service orchestration.
  - **SonarQube**: For continuous code quality analysis.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/pucrs-constrsw-2025-2/base.git
    cd base
    ```

2.  **Create the Docker volumes:**
    ```bash
    docker volume create constrsw-keycloak-data
    docker volume create constrsw-postgresql-data
    docker volume create constrsw-sonarqube-data
    docker volume create constrsw-sonarqube-extensions
    docker volume create constrsw-sonarqube-logs
    ```

## Usage

1.  **Start the application:**
    Use Docker Compose to build and start all services in detached mode.

    ```bash
    docker-compose up --build -d
    ```

2.  **Accessing the Services:**

    The credentials to access the services are configured in the `.env` file. Refer to this file to get the username and password values. For example:

    - **Keycloak Admin Console**: [http://localhost:8001](http://localhost:8001)
      - **User**: Defined in `KEYCLOAK_ADMIN`
      - **Password**: Defined in `KEYCLOAK_ADMIN_PASSWORD`
    - **SonarQube**: [http://localhost:9000](http://localhost:9000)
      - **User**: Defined in `SONARQUBE_USER`
      - **Password**: Defined in `SONARQUBE_PASSWORD`
    - **OAuth Service API**: [http://localhost:8000](http://localhost:8000)
    - **PostgreSQL**: Accessible on port `5432` at `localhost`.
      - **User**: Defined in `POSTGRESQL_USERNAME`
      - **Password**: Defined in `POSTGRESQL_PASSWORD`

3.  **Stopping the application:**
    ```bash
    docker-compose down
    ```
