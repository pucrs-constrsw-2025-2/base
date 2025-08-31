use serde::Serialize;

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct GetRoleRes {
    pub id: String,
    pub name: String,
    pub description: String,
}