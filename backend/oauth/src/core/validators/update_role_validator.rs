use crate::core::dtos::req::create_role_req::CreateRoleReq;

pub fn validate_update_role(req: &CreateRoleReq) -> Result<(), actix_web::Error> {
    if req.name.trim().is_empty() {
        return Err(actix_web::error::ErrorBadRequest("Role name is required"));
    }
    if req.container_id.trim().is_empty() {
        return Err(actix_web::error::ErrorBadRequest("Container ID is required"));
    }
    Ok(())
}