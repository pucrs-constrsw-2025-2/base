use crate::core::dtos::req::update_role_partial_req::UpdateRolePartialReq;

pub fn validate_update_role_partial(req: &UpdateRolePartialReq) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    if req.name.as_ref().is_some_and(|s| s.trim().is_empty()) {
        errors.push("name cannot be empty".into());
    }
    if req.container_id.as_ref().is_some_and(|s| s.trim().is_empty()) {
        errors.push("container_id cannot be empty".into());
    }
    if req.name.is_none()
        && req.description.is_none()
        && req.composite.is_none()
        && req.client_role.is_none()
        && req.container_id.is_none()
    {
        errors.push("at least one field must be provided".into());
    }

    if errors.is_empty() { Ok(()) } else { Err(errors) }
}