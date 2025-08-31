use serde::Deserialize;

#[derive(Deserialize)]
pub struct AssignRoleReq {
    pub role_id: String,
}