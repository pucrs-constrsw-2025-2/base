use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::req::update_user_req::UpdateUserReq;
use crate::core::dtos::res::create_user_res::CreateUserRes;
use crate::core::dtos::res::get_all_users_res::GetUsersRes;
use crate::core::dtos::res::get_user_res::GetUserRes;
use crate::core::error::AppError;

#[async_trait::async_trait]
pub trait UserProvider: Send + Sync {
    async fn create_user(&self, req: &CreateUserReq, token: &str) -> Result<CreateUserRes, AppError>;
    async fn get_users(&self, token: &str) -> Result<GetUsersRes, AppError>;
    async fn get_user(&self, id: &str, token: &str) -> Result<GetUserRes, AppError>;
    async fn update_user(&self, id: &str, req: &UpdateUserReq, token: &str) -> Result<CreateUserRes, AppError>;
    async fn update_password(&self, id: &str, password: &str, token: &str) -> Result<(), AppError>;
    async fn delete_user(&self, id: &str, token: &str) -> Result<(), AppError>;
}