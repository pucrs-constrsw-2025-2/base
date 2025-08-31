use serde::Serialize;
use crate::core::dtos::res::get_user_res::GetUserRes;

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct GetUsersRes {
    pub users: Vec<GetUserRes>
}