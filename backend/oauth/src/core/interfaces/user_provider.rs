use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::res::create_user_res::CreateUserRes;

#[async_trait::async_trait]
pub trait UserProvider: Send + Sync {
    async fn create_user(&self, req: &CreateUserReq, token: &str) -> Result<CreateUserRes, actix_web::Error>;
}