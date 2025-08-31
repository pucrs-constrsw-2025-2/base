use std::env;
use std::sync::atomic::{AtomicUsize, Ordering};

use async_trait::async_trait;
use tokio;

use oauth::core::dtos::req::login_req::{LoginReq, LoginReqKeycloak};
use oauth::core::dtos::res::login_res::LoginRes;
use oauth::core::error::AppError;
use oauth::core::interfaces::auth_provider::AuthProvider;
use oauth::core::services::general_service::login_service;
use oauth::core::dtos::res::login_res::LoginResKeycloak;

// Mock simples evitando Clone nos tipos reais
struct MockAuthProvider {
    calls: AtomicUsize,
    mode: MockMode,
}

enum MockMode {
    Success,
    ExternalError,
}

impl MockAuthProvider {
    fn success() -> Self {
        Self { calls: AtomicUsize::new(0), mode: MockMode::Success }
    }
    fn external_error() -> Self {
        Self { calls: AtomicUsize::new(0), mode: MockMode::ExternalError }
    }
    fn set_env() {
        env::set_var("KEYCLOAK_CLIENT_ID", "client-test");
        env::set_var("KEYCLOAK_CLIENT_SECRET", "secret-test");
    }
    fn calls(&self) -> usize {
        self.calls.load(Ordering::SeqCst)
    }
}

#[async_trait]
impl AuthProvider for MockAuthProvider {
    async fn login(&self, req: &LoginReqKeycloak) -> Result<LoginResKeycloak, AppError> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        match self.mode {
            MockMode::Success => Ok(LoginResKeycloak {
                token_type: "Bearer".into(),
                access_token: format!("ACC-{}-{}", req.username, req.client_id),
                expires_in: 300,
                refresh_token: "REF-123".into(),
                refresh_expires_in: 1800,
            }),
            MockMode::ExternalError => Err(AppError::ExternalServiceError {
                code: 500,
                details: "kc down".into(),
                source: None,
            }),
        }
    }
}

// ---------------- TESTES ----------------

#[tokio::test]
async fn login_service_success() {
    MockAuthProvider::set_env();
    let provider = MockAuthProvider::success();
    // usar email válido (validador exige formato de email)
    let input = LoginReq { username: "alice@gmail.com".into(), password: "pwd123".into() };

    let res: LoginRes = login_service(&provider, &input).await.expect("sucesso");

    assert_eq!(res.token_type, "Bearer");
    assert!(res.access_token.starts_with("ACC-"));
    assert!(res.access_token.contains("alice@gmail.com"));
    assert!(res.access_token.ends_with("-client-test"));
    assert_eq!(res.expires_in, 300);
    assert_eq!(res.refresh_token, "REF-123");
    assert_eq!(res.refresh_expires_in, 1800);
    assert_eq!(provider.calls(), 1);
}

#[tokio::test]
async fn login_service_validation_empty_username() {
    MockAuthProvider::set_env();
    let provider = MockAuthProvider::success();
    let input = LoginReq { username: "".into(), password: "pwd123".into() };

    let err = login_service(&provider, &input).await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(provider.calls(), 0);
}

#[tokio::test]
async fn login_service_validation_empty_password() {
    MockAuthProvider::set_env();
    let provider = MockAuthProvider::success();
    let input = LoginReq { username: "bob".into(), password: "".into() };

    let err = login_service(&provider, &input).await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(provider.calls(), 0);
}

#[tokio::test]
async fn login_service_multiple_validation_errors() {
    MockAuthProvider::set_env();
    let provider = MockAuthProvider::success();
    let input = LoginReq { username: "".into(), password: "".into() };

    let err = login_service(&provider, &input).await.unwrap_err();
    if let AppError::ValidationError { details } = err {
        let low = details.to_lowercase();
        assert!(low.contains("user"));
        assert!(low.contains("pass"));
    } else {
        panic!("Esperado ValidationError");
    }
    assert_eq!(provider.calls(), 0);
}

#[tokio::test]
async fn login_service_external_error_propagates() {
    MockAuthProvider::set_env();
    let provider = MockAuthProvider::external_error();
    // precisa ser email válido para passar validação e atingir o provider
    let input = LoginReq { username: "carol@example.com".into(), password: "pwd123".into() };

    let err = login_service(&provider, &input).await.unwrap_err();
    match err {
        AppError::ExternalServiceError { details, .. } => assert_eq!(details, "kc down"),
        other => panic!("Esperado ExternalServiceError, obtido {:?}", other),
    }
    assert_eq!(provider.calls(), 1);
}

#[tokio::test]
async fn login_service_invalid_email_format() {
    MockAuthProvider::set_env();
    let provider = MockAuthProvider::success();
    // email inválido para exercitar erro de formato
    let input = LoginReq { username: "carol".into(), password: "pwd123".into() };

    let err = login_service(&provider, &input).await.unwrap_err();
    match err {
        AppError::ValidationError { details } => {
            assert!(details.to_lowercase().contains("email"));
        }
        other => panic!("Esperado ValidationError de formato de email, obtido {:?}", other),
    }
    assert_eq!(provider.calls(), 0);
}

#[tokio::test]
async fn login_service_trims_whitespace() {
    // Caso o validator trate "  " como vazio (ajusta se não fizer parte da lógica)
    MockAuthProvider::set_env();
    let provider = MockAuthProvider::success();
    let input = LoginReq { username: "   ".into(), password: "   ".into() };

    let err = login_service(&provider, &input).await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(provider.calls(), 0);
}