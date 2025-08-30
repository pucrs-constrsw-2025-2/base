use crate::core::dtos::res::get_all_roles_res::GetAllRolesRes;

#[async_trait::async_trait]
pub trait RoleProvider: Send + Sync {
    async fn get_roles(&self, token: &str) -> Result<GetAllRolesRes, actix_web::Error>;
}