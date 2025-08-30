pub fn validate_update_password(password: &str) -> Result<(), actix_web::Error> {
    if password.trim().is_empty() {
        return Err(actix_web::error::ErrorBadRequest("Password is required"));
    }
    /**
    if password.len() < 8 {
        return Err(actix_web::error::ErrorBadRequest("Password must be at least 8 characters"));
    }
    */
    Ok(())
}