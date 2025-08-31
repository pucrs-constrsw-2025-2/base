use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::req::update_user_req::UpdateUserReq;
use crate::core::dtos::res::create_user_res::CreateUserRes;
use crate::core::dtos::res::get_all_users_res::GetUsersRes;
use crate::core::dtos::res::get_user_res::GetUserRes;
use crate::core::interfaces::user_provider::UserProvider;
use crate::core::validators::update_user_validator::validate_update_user;
use crate::core::validators::create_user_validator::validate_create_user;
use crate::core::validators::update_password_validator::validate_update_password;
use crate::core::error::AppError;

pub async fn create_user_service<P: UserProvider>(
    provider: &P,
    req: &CreateUserReq,
    token: &str,
) -> Result<CreateUserRes, AppError> {
    if let Err(errors) = validate_create_user(req) {
        return Err(AppError::ValidationError { details: errors.join(", ") });
    }
    provider.create_user(req, token).await
}

pub async fn get_users_service<P: UserProvider>(
    provider: &P,
    token: &str,
) -> Result<GetUsersRes, AppError> {
    provider.get_users(token).await
}

pub async fn get_user_service<P: UserProvider>(
    provider: &P,
    id: &str,
    token: &str,
) -> Result<GetUserRes, AppError> {
    provider.get_user(id, token).await
}

pub async fn update_user_service<P: UserProvider>(
    provider: &P,
    id: &str,
    req: &UpdateUserReq,
    token: &str,
) -> Result<CreateUserRes, AppError> {
    if let Err(errors) = validate_update_user(req) {
        return Err(AppError::ValidationError { details: errors.join(", ") });
    }
    provider.update_user(id, req, token).await
}

pub async fn update_password_service<P: UserProvider>(
    provider: &P,
    id: &str,
    password: &str,
    token: &str,
) -> Result<(), AppError> {
    if let Err(errors) = validate_update_password(password) {
        return Err(AppError::ValidationError { details: errors.join(", ") });
    }
    provider.update_password(id, password, token).await
}

pub async fn delete_user_service<P: UserProvider>(
    provider: &P,
    id: &str,
    token: &str,
) -> Result<(), AppError> {
    provider.delete_user(id, token).await
}

pub async fn add_role_to_user_service<P: UserProvider>(
    provider: &P,
    user_id: &str,
    role_id: &str,
    token: &str,
) -> Result<(), AppError> {
    if role_id.trim().is_empty() {
        return Err(AppError::ValidationError { details: "role id cannot be empty".into() });
    }
    provider.add_role(user_id, role_id, token).await
}

pub async fn remove_role_from_user_service<P: UserProvider>(
    provider: &P,
    user_id: &str,
    role_id: &str,
    token: &str,
) -> Result<(), AppError> {
    provider.remove_role(user_id, role_id, token).await
}