use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct LoginReq{
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct LoginReqKeycloak{
    pub client_id: String,
    pub client_secret: String,
    pub username: String,
    pub password: String,
    pub grant_type: String
}