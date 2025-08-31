use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct CreateRoleReq {
    pub name: String,
    pub composite: bool,
    #[serde(alias="clientRole", alias="client_role", alias="client-role")]
    pub client_role: bool,
    #[serde(alias="containerId", alias="container_id", alias="container-id")]
    pub container_id: String
}