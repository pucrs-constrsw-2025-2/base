use crate::core::dtos::req::create_role_req::CreateRoleReq;
use crate::core::dtos::res::get_all_roles_res::GetAllRolesRes;
use crate::core::dtos::res::get_role_res::GetRoleRes;
use crate::core::dtos::req::update_role_partial_req::UpdateRolePartialReq;
use crate::core::error::AppError;

#[async_trait::async_trait]
pub trait RoleProvider: Send + Sync {
    async fn create_role(&self, req: &CreateRoleReq, token: &str) -> Result<GetRoleRes, AppError>;
    async fn get_roles(&self, token: &str) -> Result<GetAllRolesRes, AppError>;
    async fn get_role(&self, id: &str, token: &str) -> Result<GetRoleRes, AppError>;
    async fn update_role(&self, id: &str, req: &CreateRoleReq, token: &str) -> Result<(), AppError>;
    async fn patch_role(&self, id: &str, req: &UpdateRolePartialReq, token: &str) -> Result<GetRoleRes, AppError>;
    async fn delete_role(&self, id: &str, token: &str) -> Result<(), AppError>;
}