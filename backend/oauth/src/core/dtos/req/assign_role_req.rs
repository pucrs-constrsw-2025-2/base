use serde::Deserialize;

#[derive(Deserialize, utoipa::ToSchema)]
pub struct AssignRoleReq {
    pub role_id: String,
}