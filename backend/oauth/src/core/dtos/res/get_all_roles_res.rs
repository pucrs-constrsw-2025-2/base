use serde::Serialize;
use crate::core::dtos::res::get_role_res::GetRoleRes;

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct GetAllRolesRes {
    pub roles: Vec<GetRoleRes>
}