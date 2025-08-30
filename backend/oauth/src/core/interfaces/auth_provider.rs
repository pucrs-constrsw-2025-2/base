use crate::core::dtos::req::login_req::LoginReqKeycloak;
use crate::core::dtos::res::login_res::LoginResKeycloak;
use crate::core::error::AppError;

#[async_trait::async_trait]
pub trait AuthProvider: Send + Sync {
    async fn login(&self, req: &LoginReqKeycloak) -> Result<LoginResKeycloak, AppError>;
}