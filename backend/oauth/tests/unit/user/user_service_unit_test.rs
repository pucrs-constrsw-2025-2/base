use async_trait::async_trait;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;

use oauth::core::error::AppError;
use oauth::core::interfaces::user_provider::UserProvider;
use oauth::core::validators::create_user_validator::validate_create_user;
use oauth::core::services::user_service::{
    create_user_service,
    get_users_service,
    get_user_service,
    update_user_service,
    update_password_service,
    delete_user_service,
    add_role_to_user_service,
    remove_role_from_user_service
};

use oauth::core::dtos::req::create_user_req::CreateUserReq;
use oauth::core::dtos::req::update_user_req::UpdateUserReq;
use oauth::core::dtos::res::create_user_res::CreateUserRes;
use oauth::core::dtos::res::get_all_users_res::GetUsersRes;
use oauth::core::dtos::res::get_user_res::GetUserRes;

// -------- Ajuste estes construtores conforme os campos reais das structs --------
fn make_valid_create_user_req() -> CreateUserReq {
    CreateUserReq {
        username: "user@example.com".into(),
        password: "StrongPass123".into(),
        first_name: "User".into(),
        last_name: "Test".into(),
        // acrescente campos obrigatórios extras se existirem
    }
}

fn make_invalid_create_user_req() -> CreateUserReq {
    CreateUserReq {
        username: "".into(),
        password: "".into(),
        first_name: "".into(),
        last_name: "".into(),
    }
}

fn base_req() -> CreateUserReq {
    CreateUserReq {
        username: "user@example.com".into(),
        password: "StrongPass123".into(),
        first_name: "First".into(),
        last_name: "Last".into(),
    }
}

fn make_valid_update_user_req() -> UpdateUserReq {
    UpdateUserReq {
        username: Some("user@example.com".into()),
        first_name: Some("New".into()),
        last_name: Some("Name".into()),
        // adicione campos Option adicionais se houver
    }
}

fn make_invalid_update_user_req() -> UpdateUserReq {
    UpdateUserReq {
        username: Some("".into()),
        first_name: Some("".into()),
        last_name: Some("".into()),
    }
}

fn make_create_user_res() -> CreateUserRes {
    CreateUserRes {
        id: "u1".into(),
        username: "user@example.com".into(),
        first_name: "User".into(),
        last_name: "Test".into(),
        enabled: true,
    }
}

fn make_get_user_res() -> GetUserRes {
    GetUserRes {
        id: "u1".into(),
        username: "user@example.com".into(),
        first_name: "User".into(),
        last_name: "Test".into(),
        enabled: true,
    }
}

fn make_get_users_res() -> GetUsersRes {
    GetUsersRes {
        users: vec![], // ajuste se houver outros campos
    }
}

// Clona AppError manualmente (já que não implementa Clone)
fn clone_app_error(e: &AppError) -> AppError {
    match e {
        AppError::ValidationError { details } =>
            AppError::ValidationError { details: details.clone() },
        AppError::ExternalServiceError { details, code, source } =>
            AppError::ExternalServiceError {
                details: details.clone(),
                code: *code,
                source: None, // Clona a fonte se for clonável
            },
        AppError::NotFound { resource, id, code } =>
            AppError::NotFound {
                resource: resource.clone(),
                id: id.clone(),
                code: *code,
            },
        AppError::Conflict { resource, details, code } =>
            AppError::Conflict {
                resource: resource.clone(),
                details: details.clone(),
                code: *code,
            },
        AppError::Forbidden { code } => AppError::Forbidden { code: *code },
        AppError::InvalidToken { code } => AppError::InvalidToken { code: *code },
        AppError::InvalidCredentials { code } => AppError::InvalidCredentials { code: *code },
    }
}

// -------- Mock --------
struct MockUserProvider {
    err_create: Mutex<Option<AppError>>,
    err_get_users: Mutex<Option<AppError>>,
    err_get_user: Mutex<Option<AppError>>,
    err_update_user: Mutex<Option<AppError>>,
    err_update_password: Mutex<Option<AppError>>,
    err_delete_user: Mutex<Option<AppError>>,
    err_add_role: Mutex<Option<AppError>>,
    err_remove_role: Mutex<Option<AppError>>,

    calls_create: AtomicUsize,
    calls_get_users: AtomicUsize,
    calls_get_user: AtomicUsize,
    calls_update_user: AtomicUsize,
    calls_update_password: AtomicUsize,
    calls_delete_user: AtomicUsize,
    calls_add_role: AtomicUsize,
    calls_remove_role: AtomicUsize,
}

impl MockUserProvider {
    fn new() -> Self {
        Self {
            err_create: Mutex::new(None),
            err_get_users: Mutex::new(None),
            err_get_user: Mutex::new(None),
            err_update_user: Mutex::new(None),
            err_update_password: Mutex::new(None),
            err_delete_user: Mutex::new(None),
            err_add_role: Mutex::new(None),
            err_remove_role: Mutex::new(None),
            calls_create: AtomicUsize::new(0),
            calls_get_users: AtomicUsize::new(0),
            calls_get_user: AtomicUsize::new(0),
            calls_update_user: AtomicUsize::new(0),
            calls_update_password: AtomicUsize::new(0),
            calls_delete_user: AtomicUsize::new(0),
            calls_add_role: AtomicUsize::new(0),
            calls_remove_role: AtomicUsize::new(0),
        }
    }

    fn set_create_error(&self, e: AppError) { *self.err_create.lock().unwrap() = Some(e); }
    fn set_get_users_error(&self, e: AppError) { *self.err_get_users.lock().unwrap() = Some(e); }
    fn set_get_user_error(&self, e: AppError) { *self.err_get_user.lock().unwrap() = Some(e); }
    fn set_update_user_error(&self, e: AppError) { *self.err_update_user.lock().unwrap() = Some(e); }
    fn set_update_password_error(&self, e: AppError) { *self.err_update_password.lock().unwrap() = Some(e); }
    fn set_delete_user_error(&self, e: AppError) { *self.err_delete_user.lock().unwrap() = Some(e); }
    fn set_add_role_error(&self, e: AppError) { *self.err_add_role.lock().unwrap() = Some(e); }
    fn set_remove_role_error(&self, e: AppError) { *self.err_remove_role.lock().unwrap() = Some(e); }
}

#[async_trait]
impl UserProvider for MockUserProvider {
    async fn create_user(&self, _req: &CreateUserReq, _token: &str) -> Result<CreateUserRes, AppError> {
        self.calls_create.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = &*self.err_create.lock().unwrap() { Err(clone_app_error(e)) } else { Ok(make_create_user_res()) }
    }
    async fn get_users(&self, _token: &str) -> Result<GetUsersRes, AppError> {
        self.calls_get_users.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = &*self.err_get_users.lock().unwrap() { Err(clone_app_error(e)) } else { Ok(make_get_users_res()) }
    }
    async fn get_user(&self, _id: &str, _token: &str) -> Result<GetUserRes, AppError> {
        self.calls_get_user.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = &*self.err_get_user.lock().unwrap() { Err(clone_app_error(e)) } else { Ok(make_get_user_res()) }
    }
    async fn update_user(&self, _id: &str, _req: &UpdateUserReq, _token: &str) -> Result<CreateUserRes, AppError> {
        self.calls_update_user.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = &*self.err_update_user.lock().unwrap() { Err(clone_app_error(e)) } else { Ok(make_create_user_res()) }
    }
    async fn update_password(&self, _id: &str, _password: &str, _token: &str) -> Result<(), AppError> {
        self.calls_update_password.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = &*self.err_update_password.lock().unwrap() { Err(clone_app_error(e)) } else { Ok(()) }
    }
    async fn delete_user(&self, _id: &str, _token: &str) -> Result<(), AppError> {
        self.calls_delete_user.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = &*self.err_delete_user.lock().unwrap() { Err(clone_app_error(e)) } else { Ok(()) }
    }
    async fn add_role(&self, _user_id: &str, _role_id: &str, _token: &str) -> Result<(), AppError> {
        self.calls_add_role.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = &*self.err_add_role.lock().unwrap() { Err(clone_app_error(e)) } else { Ok(()) }
    }
    async fn remove_role(&self, _user_id: &str, _role_id: &str, _token: &str) -> Result<(), AppError> {
        self.calls_remove_role.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = &*self.err_remove_role.lock().unwrap() { Err(clone_app_error(e)) } else { Ok(()) }
    }
}

// ---------------- Tests ----------------

#[tokio::test]
async fn create_user_service_success() {
    let mock = MockUserProvider::new();
    let req = make_valid_create_user_req();
    create_user_service(&mock, &req, "tok").await.expect("ok");
    assert_eq!(mock.calls_create.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn create_user_service_validation_error() {
    let mock = MockUserProvider::new();
    let req = make_invalid_create_user_req();
    let err = create_user_service(&mock, &req, "tok").await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(mock.calls_create.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn create_user_service_provider_error() {
    let mock = MockUserProvider::new();
    mock.set_create_error(AppError::ExternalServiceError {
        details: "down".into(),
        code: 500,
        source: None,
    });
    let req = make_valid_create_user_req();
    let err = create_user_service(&mock, &req, "tok").await.unwrap_err();
    matches!(err, AppError::ExternalServiceError { .. });
    assert_eq!(mock.calls_create.load(Ordering::SeqCst), 1);
}

#[test]
fn create_user_invalid_email_format() {
    let mut req = base_req();
    req.username = "invalid-email".into(); // sem '@'
    let err = validate_create_user(&req).unwrap_err();
    assert!(err.iter().any(|e| e == "Invalid email format"));
}

#[tokio::test]
async fn get_users_service_success() {
    let mock = MockUserProvider::new();
    get_users_service(&mock, "tok").await.expect("ok");
    assert_eq!(mock.calls_get_users.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn get_users_service_error() {
    let mock = MockUserProvider::new();
    mock.set_get_users_error(AppError::ExternalServiceError {
        details: "err".into(),
        code: 500,
        source: None,
    });
    let err = get_users_service(&mock, "tok").await.unwrap_err();
    matches!(err, AppError::ExternalServiceError { .. });
    assert_eq!(mock.calls_get_users.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn get_user_service_success() {
    let mock = MockUserProvider::new();
    get_user_service(&mock, "u1", "tok").await.expect("ok");
    assert_eq!(mock.calls_get_user.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn get_user_service_error() {
    let mock = MockUserProvider::new();
    mock.set_get_user_error(AppError::NotFound {
        resource: "user".into(),
        id: "u1".into(),
        code: 404,
    });
    let err = get_user_service(&mock, "u1", "tok").await.unwrap_err();
    matches!(err, AppError::NotFound { .. });
    assert_eq!(mock.calls_get_user.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn update_user_service_success() {
    let mock = MockUserProvider::new();
    let req = make_valid_update_user_req();
    update_user_service(&mock, "u1", &req, "tok").await.expect("ok");
    assert_eq!(mock.calls_update_user.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn update_user_service_validation_error() {
    let mock = MockUserProvider::new();
    let req = make_invalid_update_user_req();
    let err = update_user_service(&mock, "u1", &req, "tok").await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(mock.calls_update_user.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn update_user_service_provider_error() {
    let mock = MockUserProvider::new();
    mock.set_update_user_error(AppError::Conflict {
        resource: "user".into(),
        details: "email exists".into(),
        code: 409,
    });
    let req = make_valid_update_user_req();
    let err = update_user_service(&mock, "u1", &req, "tok").await.unwrap_err();
    matches!(err, AppError::Conflict { .. });
    assert_eq!(mock.calls_update_user.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn update_password_service_success() {
    let mock = MockUserProvider::new();
    update_password_service(&mock, "u1", "NewPass123", "tok").await.expect("ok");
    assert_eq!(mock.calls_update_password.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn update_password_service_validation_error() {
    let mock = MockUserProvider::new();
    let err = update_password_service(&mock, "u1", "", "tok").await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(mock.calls_update_password.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn update_password_service_provider_error() {
    let mock = MockUserProvider::new();
    mock.set_update_password_error(AppError::ExternalServiceError {
        details: "fail".into(),
        code: 500,
        source: None,
    });
    let err = update_password_service(&mock, "u1", "ValidPass1", "tok").await.unwrap_err();
    matches!(err, AppError::ExternalServiceError { .. });
    assert_eq!(mock.calls_update_password.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn delete_user_service_success() {
    let mock = MockUserProvider::new();
    delete_user_service(&mock, "u1", "tok").await.expect("ok");
    assert_eq!(mock.calls_delete_user.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn delete_user_service_error() {
    let mock = MockUserProvider::new();
    mock.set_delete_user_error(AppError::Forbidden { code: 403 });
    let err = delete_user_service(&mock, "u1", "tok").await.unwrap_err();
    matches!(err, AppError::Forbidden { .. });
    assert_eq!(mock.calls_delete_user.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn add_role_to_user_service_success() {
    let mock = MockUserProvider::new();
    add_role_to_user_service(&mock, "u1", "roleA", "tok").await.expect("ok");
    assert_eq!(mock.calls_add_role.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn add_role_to_user_service_validation_error() {
    let mock = MockUserProvider::new();
    let err = add_role_to_user_service(&mock, "u1", "   ", "tok").await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(mock.calls_add_role.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn add_role_to_user_service_provider_error() {
    let mock = MockUserProvider::new();
    mock.set_add_role_error(AppError::NotFound {
        resource: "role".into(),
        id: "roleA".into(),
        code: 404,
    });
    let err = add_role_to_user_service(&mock, "u1", "roleA", "tok").await.unwrap_err();
    matches!(err, AppError::NotFound { .. });
    assert_eq!(mock.calls_add_role.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn remove_role_from_user_service_success() {
    let mock = MockUserProvider::new();
    remove_role_from_user_service(&mock, "u1", "roleA", "tok").await.expect("ok");
    assert_eq!(mock.calls_remove_role.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn remove_role_from_user_service_error() {
    let mock = MockUserProvider::new();
    mock.set_remove_role_error(AppError::ExternalServiceError {
        details: "kc".into(),
        code: 500,
        source: None,
    });
    let err = remove_role_from_user_service(&mock, "u1", "roleA", "tok").await.unwrap_err();
    matches!(err, AppError::ExternalServiceError { .. });
    assert_eq!(mock.calls_remove_role.load(Ordering::SeqCst), 1);
}