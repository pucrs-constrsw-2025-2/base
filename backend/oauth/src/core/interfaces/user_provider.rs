use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::res::create_user_res::CreateUserRes;
use crate::core::dtos::res::get_all_users_res::GetUsersRes;
use crate::core::dtos::res::get_user_res::GetUserRes;

#[async_trait::async_trait]
pub trait UserProvider: Send + Sync {
    async fn create_user(&self, req: &CreateUserReq, token: &str) -> Result<CreateUserRes, actix_web::Error>;
    async fn get_users(&self, token: &str) -> Result<GetUsersRes, actix_web::Error>;
    async fn get_user(&self, id: &str, token: &str) -> Result<GetUserRes, actix_web::Error>;
}