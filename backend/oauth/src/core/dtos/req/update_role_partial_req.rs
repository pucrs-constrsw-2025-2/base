use serde::Deserialize;

#[derive(Deserialize)]
pub struct UpdateRolePartialReq {
    pub name: Option<String>,
    pub description: Option<String>,
    pub composite: Option<bool>,
    pub client_role: Option<bool>,
    pub container_id: Option<String>,
}