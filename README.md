# 🚀 Closed CRAS - OAuth Backend 🚀

Welcome to the backend of the **Closed CRAS** application! This project is a powerful and secure REST API that acts as a gateway to the Keycloak REST API, simplifying user and role management.

## ✨ Features

*   🔐 **User Authentication**: Secure user authentication with JWT (JSON Web Tokens).
*   👥 **User Management**: Full CRUD operations for users.
*   🎭 **Role Management**: Full CRUD operations for roles.
*   🔑 **Keycloak Integration**: Seamless integration with Keycloak for robust identity and access management.
*   🛡️ **Role-Based Access Control (RBAC)**: Secure your endpoints with a flexible role-based access control system.
*   🏗️ **Scalable Architecture**: Built with a modular architecture that is easy to maintain and scale.

## 🛠️ Technologies Used

*   **Framework**: [NestJS](https://nestjs.com/) (v11) 🐈
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (v5) 🔷
*   **Authentication**: [Keycloak](https://www.keycloak.org/) 🔑
*   **Containerization**: [Docker](https://www.docker.com/) 🐳
*   **API Client**: [Postman](https://www.postman.com/) 📮
*   **Testing**: [Jest](https://jestjs.io/) 🃏
*   **Linting**: [ESLint](https://eslint.org/) 🧹
*   **Formatting**: [Prettier](https://prettier.io/) 💅

## 🏛️ Architecture

The application follows a modular architecture, with each feature encapsulated in its own module. This promotes separation of concerns and makes the codebase easier to maintain and scale.

### Core Modules

*   **`AppModule`**: The root module of the application.
*   **`AuthModule`**: Handles user authentication, including login and token validation.
*   **`UsersModule`**: Manages user-related operations (CRUD).
*   **`RolesModule`**: Manages role-related operations (CRUD).
*   **`KeycloakModule`**: Provides the integration with Keycloak through a `KeycloakAdapter`, which abstracts the communication with the Keycloak API.

### Key Components

*   **`KeycloakAdapter`**: A custom adapter that encapsulates all the logic for interacting with the Keycloak Admin API, including user and role management, and token validation.
*   **`AuthGuard`**: A global guard that protects all endpoints by default, requiring a valid JWT for access. Public routes can be decorated with `@Public()` to bypass this guard.
*   **`HttpExceptionFilter`**: A global filter that catches `HttpException` and formats the error response in a consistent way.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or higher)
*   [npm](https://www.npmjs.com/)
*   [Docker](https://www.docker.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the backend directory:
    ```bash
    cd backend/oauth
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

#### With Docker

The easiest way to get the application running is by using Docker. This will also start a Keycloak instance and a PostgreSQL database.

1.  Make sure you have Docker installed and running.
2.  Run the following command from the root of the project:
    ```bash
    docker-compose up
    ```

#### Without Docker

1.  Make sure you have a running instance of [Keycloak](https://www.keycloak.org/).
2.  Create a `.env` file in the `backend/oauth` directory with the necessary environment variables for connecting to Keycloak.
3.  Start the application in development mode:
    ```bash
    npm run start:dev
    ```

The application will be running on `http://localhost:3000` by default.

## 📮 API Documentation

This project includes a Postman collection that you can use to test the API.

1.  Open Postman.
2.  Import the `ConstrSW.postman_collection.json` file located in the root of the project.
3.  Import the `ConstrSW.postman_environment.json` file to set up the environment variables.

## ✅ Running the Tests

This project uses Jest for unit and integration testing. The tests are located alongside the source files, with the `.spec.ts` extension.

*   **Run all tests**:
    ```bash
    npm test
    ```
*   **Run tests with coverage report**:
    ```bash
    npm run test:cov
    ```

The project has a high test coverage, ensuring the code is reliable and maintainable.

## 💅 Linting and Formatting

This project uses ESLint for linting and Prettier for code formatting. These tools help to maintain a consistent code style and to avoid common errors.

*   **Run the linter**:
    ```bash
    npm run lint
    ```
*   **Format the code**:
    ```bash
    npm run format
    ```

## 👥 Group Members

*   Mariah Freire
*   Eduardo Wolf
*   Urien Nolasco
*   Brenda Brizzola