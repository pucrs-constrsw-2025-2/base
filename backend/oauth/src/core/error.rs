use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde::Serialize;
use std::error::Error;
use thiserror::Error;

const ERROR_SOURCE: &str = "OAuthAPI";

#[derive(Serialize)]
struct ErrorStackItem {
    source: String,
    description: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error_code: String,
    error_description: String,
    error_source: String,
    error_stack: Vec<ErrorStackItem>,
}

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Invalid input: {details}")]
    ValidationError { details: String },

    #[error("Invalid credentials")]
    InvalidCredentials { code: u16 },

    #[error("Invalid or expired token")]
    InvalidToken { code: u16 },

    #[error("Forbidden")]
    Forbidden { code: u16 },

    #[error("{resource} with id {id} not found")]
    NotFound {
        code: u16,
        resource: String,
        id: String,
    },

    #[error("{resource} conflict: {details}")]
    Conflict {
        code: u16,
        resource: String,
        details: String,
    },

    #[error("External service error: {details}")]
    ExternalServiceError {
        code: u16,
        details: String,
        #[source]
        source: Option<reqwest::Error>,
    },
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::ValidationError { .. } => StatusCode::BAD_REQUEST,
            AppError::InvalidCredentials { .. } => StatusCode::UNAUTHORIZED,
            AppError::InvalidToken { .. } => StatusCode::UNAUTHORIZED,
            AppError::Forbidden { .. } => StatusCode::FORBIDDEN,
            AppError::NotFound { .. } => StatusCode::NOT_FOUND,
            AppError::Conflict { .. } => StatusCode::CONFLICT,
            AppError::ExternalServiceError { code, .. } => {
                StatusCode::from_u16(*code).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    }

    fn error_response(&self) -> HttpResponse {
        let status_code = self.status_code();
        let error_description = self.to_string();

        let error_code = match self {
            AppError::ValidationError { .. } => "OA-001".to_string(), // Custom internal code
            AppError::InvalidCredentials { code } => code.to_string(),
            AppError::InvalidToken { code } => code.to_string(),
            AppError::Forbidden { code } => code.to_string(),
            AppError::NotFound { code, .. } => code.to_string(),
            AppError::Conflict { code, .. } => code.to_string(),
            AppError::ExternalServiceError { code, .. } => code.to_string(),
        };

        let mut error_stack = Vec::new();
        let mut current_error: Option<&dyn Error> = self.source();
        while let Some(cause) = current_error {
            error_stack.push(ErrorStackItem {
                source: format!("{:?}", cause),
                description: cause.to_string(),
            });
            current_error = cause.source();
        }

        let error_response = ErrorResponse {
            error_code,
            error_description,
            error_source: ERROR_SOURCE.to_string(),
            error_stack,
        };

        HttpResponse::build(status_code).json(error_response)
    }
}
