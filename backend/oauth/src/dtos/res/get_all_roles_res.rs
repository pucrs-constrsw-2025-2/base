use serde::Serialize;
use crate::dtos::res::get_role_res::GetRoleRes;

#[derive(Debug, Serialize)]
pub struct GetAllRolesRes {
    pub roles: Vec<GetRoleRes>
}