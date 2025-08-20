use serde::Serialize;
use crate::dtos::res::get_user_res::GetUserRes;

#[derive(Debug, Serialize)]
pub struct GetUsersRes {
    pub users: Vec<GetUserRes>,
}