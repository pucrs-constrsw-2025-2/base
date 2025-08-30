use crate::core::interfaces::role_provider::RoleProvider;
use crate::core::dtos::req::create_role_req::CreateRoleReq;
use crate::core::dtos::res::get_role_res::GetRoleRes;
use crate::core::dtos::res::get_all_roles_res::GetAllRolesRes;
use crate::core::validators::create_role_validator::validate_create_role;

pub async fn get_roles_service<P: RoleProvider>(
    provider: &P,
    token: &str,
) -> Result<GetAllRolesRes, actix_web::Error> {
    provider.get_roles(token).await
}

pub async fn get_role_service<P: RoleProvider>(
    provider: &P,
    id: &str,
    token: &str,
) -> Result<GetRoleRes, actix_web::Error> {
    provider.get_role(id, token).await
}

pub async fn create_role_service<P: RoleProvider>(
    provider: &P,
    req: &CreateRoleReq,
    token: &str,
) -> Result<GetRoleRes, actix_web::Error> {
    validate_create_role(&req)?;
    provider.create_role(req, token).await
}