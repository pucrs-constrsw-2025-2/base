use async_trait::async_trait;
use std::sync::{Mutex};
use std::sync::atomic::{AtomicUsize, Ordering};

use oauth::core::error::AppError;
use oauth::core::interfaces::role_provider::RoleProvider;
use oauth::core::services::role_service::{
    get_roles_service,
    get_role_service,
    create_role_service,
    update_role_service,
    delete_role_service,
    patch_role_service,
};

use oauth::core::validators::create_role_validator::validate_create_role;
use oauth::core::validators::update_role_validator::validate_update_role;
use oauth::core::validators::patch_role_validator::validate_update_role_partial;
use oauth::core::dtos::req::create_role_req::CreateRoleReq;
use oauth::core::dtos::req::update_role_partial_req::UpdateRolePartialReq;
use oauth::core::dtos::res::get_all_roles_res::GetAllRolesRes;
use oauth::core::dtos::res::get_role_res::GetRoleRes;

// -------- Helpers (AJUSTE CAMPOS CONFORME SUAS STRUCTS REAIS) --------
fn valid_create_req() -> CreateRoleReq {
    CreateRoleReq {
        name: "role_ok".into(),
        composite: false,
        client_role: false,
        container_id: "container-1".into(),
    }
}

fn make_valid_create_role_req() -> CreateRoleReq {
    CreateRoleReq {
        // Exemplo provável; ajuste se sua struct difere
        name: "admin".into(),
        composite: false,
        client_role: false,
        container_id: "my-container".into(),
    }
}

fn make_invalid_create_role_req() -> CreateRoleReq {
    CreateRoleReq {
        name: "".into(),                // força erro de validação (nome vazio)
        composite: false,
        client_role: false,
        container_id: "my-container".into(),
    }
}

fn make_valid_update_role_req() -> CreateRoleReq {
    CreateRoleReq {
        name: "editor".into(),
        composite: false,
        client_role: false,
        container_id: "my-container".into(),
    }
}

fn make_invalid_update_role_req() -> CreateRoleReq {
    CreateRoleReq {
        name: "  ".into(),              // inválido
        composite: false,
        client_role: false,
        container_id: "my-container".into(),
    }
}

fn make_valid_patch_role_req() -> UpdateRolePartialReq {
    UpdateRolePartialReq {
        name: Some("patched-role".into()),
        description: None,
        client_role: None,
        composite: None,
        container_id: None,
    }
}

fn make_invalid_patch_role_req() -> UpdateRolePartialReq {
    UpdateRolePartialReq {
        name: Some("".into()),          // inválido
        description: None,
        client_role: None,
        composite: None,
        container_id: Some("".into())  // inválido
    }
}

fn make_get_role_res() -> GetRoleRes {
    GetRoleRes {
        id: "r1".into(),
        name: "admin".into(),
        description: "Administrative role".into(),
        // acrescente outros campos obrigatórios se existirem
    }
}

fn make_get_all_roles_res() -> GetAllRolesRes {
    GetAllRolesRes {
        roles: vec![
            make_get_role_res()
        ],
    }
}

// -------- Mock RoleProvider --------
struct MockRoleProvider {
    err_create: Mutex<Option<AppError>>,
    err_get_roles: Mutex<Option<AppError>>,
    err_get_role: Mutex<Option<AppError>>,
    err_update_role: Mutex<Option<AppError>>,
    err_patch_role: Mutex<Option<AppError>>,
    err_delete_role: Mutex<Option<AppError>>,

    calls_create: AtomicUsize,
    calls_get_roles: AtomicUsize,
    calls_get_role: AtomicUsize,
    calls_update_role: AtomicUsize,
    calls_patch_role: AtomicUsize,
    calls_delete_role: AtomicUsize,
}

impl MockRoleProvider {
    fn new() -> Self {
        Self {
            err_create: Mutex::new(None),
            err_get_roles: Mutex::new(None),
            err_get_role: Mutex::new(None),
            err_update_role: Mutex::new(None),
            err_patch_role: Mutex::new(None),
            err_delete_role: Mutex::new(None),
            calls_create: AtomicUsize::new(0),
            calls_get_roles: AtomicUsize::new(0),
            calls_get_role: AtomicUsize::new(0),
            calls_update_role: AtomicUsize::new(0),
            calls_patch_role: AtomicUsize::new(0),
            calls_delete_role: AtomicUsize::new(0),
        }
    }
    fn set_create_error(&self, e: AppError) { *self.err_create.lock().unwrap() = Some(e); }
    fn set_get_roles_error(&self, e: AppError) { *self.err_get_roles.lock().unwrap() = Some(e); }
    fn set_get_role_error(&self, e: AppError) { *self.err_get_role.lock().unwrap() = Some(e); }
    fn set_update_role_error(&self, e: AppError) { *self.err_update_role.lock().unwrap() = Some(e); }
    fn set_patch_role_error(&self, e: AppError) { *self.err_patch_role.lock().unwrap() = Some(e); }
    fn set_delete_role_error(&self, e: AppError) { *self.err_delete_role.lock().unwrap() = Some(e); }
}

#[async_trait]
impl RoleProvider for MockRoleProvider {
    async fn create_role(&self, _req: &CreateRoleReq, _token: &str) -> Result<GetRoleRes, AppError> {
        self.calls_create.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = self.err_create.lock().unwrap().take() { Err(e) } else { Ok(make_get_role_res()) }
    }
    async fn get_roles(&self, _token: &str) -> Result<GetAllRolesRes, AppError> {
        self.calls_get_roles.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = self.err_get_roles.lock().unwrap().take() { Err(e) } else { Ok(make_get_all_roles_res()) }
    }
    async fn get_role(&self, id: &str, _token: &str) -> Result<GetRoleRes, AppError> {
        self.calls_get_role.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = self.err_get_role.lock().unwrap().take() { Err(e) } else {
            let mut r = make_get_role_res();
            r.id = id.into();
            Ok(r)
        }
    }
    async fn update_role(&self, _id: &str, _req: &CreateRoleReq, _token: &str) -> Result<(), AppError> {
        self.calls_update_role.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = self.err_update_role.lock().unwrap().take() { Err(e) } else { Ok(()) }
    }
    async fn patch_role(&self, _id: &str, _req: &UpdateRolePartialReq, _token: &str) -> Result<GetRoleRes, AppError> {
        self.calls_patch_role.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = self.err_patch_role.lock().unwrap().take() { Err(e) } else { Ok(make_get_role_res()) }
    }
    async fn delete_role(&self, _id: &str, _token: &str) -> Result<(), AppError> {
        self.calls_delete_role.fetch_add(1, Ordering::SeqCst);
        if let Some(e) = self.err_delete_role.lock().unwrap().take() { Err(e) } else { Ok(()) }
    }
}

// ---------------- Tests ----------------

#[tokio::test]
async fn get_roles_service_success() {
    let mock = MockRoleProvider::new();
    get_roles_service(&mock, "tok").await.expect("ok");
    assert_eq!(mock.calls_get_roles.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn get_roles_service_error() {
    let mock = MockRoleProvider::new();
    mock.set_get_roles_error(AppError::ExternalServiceError { details: "down".into() });
    let err = get_roles_service(&mock, "tok").await.unwrap_err();
    matches!(err, AppError::ExternalServiceError { .. });
    assert_eq!(mock.calls_get_roles.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn get_role_service_success() {
    let mock = MockRoleProvider::new();
    get_role_service(&mock, "r1", "tok").await.expect("ok");
    assert_eq!(mock.calls_get_role.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn get_role_service_not_found() {
    let mock = MockRoleProvider::new();
    mock.set_get_role_error(AppError::NotFound { resource: "role".into(), id: "rX".into() });
    let err = get_role_service(&mock, "rX", "tok").await.unwrap_err();
    matches!(err, AppError::NotFound { .. });
    assert_eq!(mock.calls_get_role.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn create_role_service_success() {
    let mock = MockRoleProvider::new();
    let req = make_valid_create_role_req();
    create_role_service(&mock, &req, "tok").await.expect("ok");
    assert_eq!(mock.calls_create.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn create_role_service_validation_error() {
    let mock = MockRoleProvider::new();
    let req = make_invalid_create_role_req();
    let err = create_role_service(&mock, &req, "tok").await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(mock.calls_create.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn create_role_service_provider_error() {
    let mock = MockRoleProvider::new();
    mock.set_create_error(AppError::Conflict { resource: "role".into(), details: "name exists".into() });
    let req = make_valid_create_role_req();
    let err = create_role_service(&mock, &req, "tok").await.unwrap_err();
    matches!(err, AppError::Conflict { .. });
    assert_eq!(mock.calls_create.load(Ordering::SeqCst), 1);
}

#[test]
fn create_role_missing_container_id() {
    let mut req = valid_create_req();
    req.container_id = "".into(); // força erro
    let errs = validate_create_role(&req).unwrap_err();
    assert!(errs.iter().any(|e| e == "Container ID is required"), "Erro esperado não encontrado: {:?}", errs);
}

#[tokio::test]
async fn update_role_service_success() {
    let mock = MockRoleProvider::new();
    let req = make_valid_update_role_req();
    update_role_service(&mock, "r1", &req, "tok").await.expect("ok");
    assert_eq!(mock.calls_update_role.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn update_role_service_validation_error() {
    let mock = MockRoleProvider::new();
    let req = make_invalid_update_role_req();
    let err = update_role_service(&mock, "r1", &req, "tok").await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(mock.calls_update_role.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn update_role_service_provider_error() {
    let mock = MockRoleProvider::new();
    mock.set_update_role_error(AppError::ExternalServiceError { details: "fail".into() });
    let req = make_valid_update_role_req();
    let err = update_role_service(&mock, "r1", &req, "tok").await.unwrap_err();
    matches!(err, AppError::ExternalServiceError { .. });
    assert_eq!(mock.calls_update_role.load(Ordering::SeqCst), 1);
}

#[test]
fn update_role_missing_container_id() {
    // Supondo que update usa o mesmo DTO (CreateRoleReq)
    let mut req = valid_create_req();
    req.container_id = "   ".into(); // whitespace
    let errs = validate_update_role(&req).unwrap_err();
    assert!(errs.iter().any(|e| e == "Container ID is required"), "Erro esperado não encontrado: {:?}", errs);
}

#[tokio::test]
async fn patch_role_service_success() {
    let mock = MockRoleProvider::new();
    let req = make_valid_patch_role_req();
    patch_role_service(&mock, "r1", &req, "tok").await.expect("ok");
    assert_eq!(mock.calls_patch_role.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn patch_role_service_validation_error() {
    let mock = MockRoleProvider::new();
    let req = make_invalid_patch_role_req();
    let err = patch_role_service(&mock, "r1", &req, "tok").await.unwrap_err();
    matches!(err, AppError::ValidationError { .. });
    assert_eq!(mock.calls_patch_role.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn patch_role_service_provider_error() {
    let mock = MockRoleProvider::new();
    mock.set_patch_role_error(AppError::ExternalServiceError { details: "ext".into() });
    let req = make_valid_patch_role_req();
    let err = patch_role_service(&mock, "r1", &req, "tok").await.unwrap_err();
    matches!(err, AppError::ExternalServiceError { .. });
    assert_eq!(mock.calls_patch_role.load(Ordering::SeqCst), 1);
}

#[test]
fn patch_role_all_fields_none() {
    let req = UpdateRolePartialReq {
        name: None,
        description: None,
        client_role: None,
        composite: None,
        container_id: None,
    };
    let errs = validate_update_role_partial(&req).unwrap_err();
    assert!(errs.iter().any(|e| e == "at least one field must be provided"), "Erro esperado não encontrado: {:?}", errs);
}

#[test]
fn patch_role_one_field_provided_no_aggregate_error() {
    let req = UpdateRolePartialReq {
        name: Some("new-name".into()),
        description: None,
        client_role: None,
        composite: None,
        container_id: None,
    };
    let res = validate_update_role_partial(&req);
    if let Err(errs) = res {
        // Não deve conter o erro agregado
        assert!(!errs.iter().any(|e| e == "at least one field must be provided"), "Erro agregado indevido: {:?}", errs);
    }
}

#[tokio::test]
async fn delete_role_service_success() {
    let mock = MockRoleProvider::new();
    delete_role_service(&mock, "r1", "tok").await.expect("ok");
    assert_eq!(mock.calls_delete_role.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn delete_role_service_error() {
    let mock = MockRoleProvider::new();
    mock.set_delete_role_error(AppError::Forbidden);
    let err = delete_role_service(&mock, "r1", "tok").await.unwrap_err();
    matches!(err, AppError::Forbidden);
    assert_eq!(mock.calls_delete_role.load(Ordering::SeqCst), 1);
}