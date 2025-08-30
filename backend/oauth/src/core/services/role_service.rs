use crate::core::interfaces::role_provider::RoleProvider;
use crate::core::dtos::req::create_role_req::CreateRoleReq;
use crate::core::dtos::res::get_role_res::GetRoleRes;
use crate::core::dtos::res::get_all_roles_res::GetAllRolesRes;
use crate::core::validators::create_role_validator::validate_create_role;
use crate::core::validators::update_role_validator::validate_update_role;
use crate::core::error::AppError;

pub async fn get_roles_service<P: RoleProvider>(
    provider: &P,
    token: &str,
) -> Result<GetAllRolesRes, AppError> {
    provider.get_roles(token).await
}

pub async fn get_role_service<P: RoleProvider>(
    provider: &P,
    id: &str,
    token: &str,
) -> Result<GetRoleRes, AppError> {
    provider.get_role(id, token).await
}

pub async fn create_role_service<P: RoleProvider>(
    provider: &P,
    req: &CreateRoleReq,
    token: &str,
) -> Result<GetRoleRes, AppError> {
    if let Err(errors) = validate_create_role(&req) {
        return Err(AppError::ValidationError { details: errors.join(", ") });
    }
    provider.create_role(req, token).await
}

pub async fn update_role_service<P: RoleProvider>(
    provider: &P,
    id: &str,
    req: &CreateRoleReq,
    token: &str,
) -> Result<(), AppError> {
    if let Err(errors) = validate_update_role(req) {
        return Err(AppError::ValidationError { details: errors.join(", ") });
    }
    provider.update_role(id, req, token).await
}

pub async fn delete_role_service<P: RoleProvider>(
    provider: &P,
    id: &str,
    token: &str
) -> Result<(), AppError> {
    provider.delete_role(id, token).await
}