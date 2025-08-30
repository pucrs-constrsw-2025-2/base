use crate::core::interfaces::role_provider::RoleProvider;
use crate::core::dtos::res::get_all_roles_res::GetAllRolesRes;

pub async fn get_roles_service<P: RoleProvider>(
    provider: &P,
    token: &str,
) -> Result<GetAllRolesRes, actix_web::Error> {
    provider.get_roles(token).await
}