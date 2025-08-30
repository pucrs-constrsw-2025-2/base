use crate::core::dtos::req::create_role_req::CreateRoleReq;

pub fn validate_update_role(req: &CreateRoleReq) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();
    if req.name.trim().is_empty() {
        errors.push("Role name is required".to_string());
    }
    if req.container_id.trim().is_empty() {
        errors.push("Container ID is required".to_string());
    }
    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}