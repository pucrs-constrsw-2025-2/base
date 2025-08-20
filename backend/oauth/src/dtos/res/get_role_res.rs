use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct GetRoleRes {
    pub id: String,
    pub name: String,
    pub description: String,
}