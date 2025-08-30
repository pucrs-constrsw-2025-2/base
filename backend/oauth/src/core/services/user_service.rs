use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::res::create_user_res::CreateUserRes;
use crate::core::dtos::res::get_all_users_res::GetUsersRes;
use crate::core::interfaces::user_provider::UserProvider;
use crate::core::validators::create_user_validator::validate_create_user;

pub async fn create_user_service<P: UserProvider>(
    provider: &P,
    req: &CreateUserReq,
    token: &str,
) -> Result<CreateUserRes, actix_web::Error> {
    validate_create_user(req)?;
    provider.create_user(req, token).await
}

pub async fn get_users_service<P: UserProvider>(
    provider: &P,
    token: &str,
) -> Result<GetUsersRes, actix_web::Error> {
    provider.get_users(token).await
}