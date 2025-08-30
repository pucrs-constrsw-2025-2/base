use crate::core::dtos::req::create_role_req::CreateRoleReq;
use crate::core::dtos::res::get_all_roles_res::GetAllRolesRes;
use crate::core::dtos::res::get_role_res::GetRoleRes;

#[async_trait::async_trait]
pub trait RoleProvider: Send + Sync {
    async fn create_role(&self, req: &CreateRoleReq, token: &str) -> Result<GetRoleRes, actix_web::Error>;
    async fn get_roles(&self, token: &str) -> Result<GetAllRolesRes, actix_web::Error>;
    async fn get_role(&self, id: &str, token: &str) -> Result<GetRoleRes, actix_web::Error>;
    async fn update_role(&self, id: &str, req: &CreateRoleReq, token: &str) -> Result<(), actix_web::Error>;
    async fn delete_role(&self, id: &str, token: &str) -> Result<(), actix_web::Error>;
}