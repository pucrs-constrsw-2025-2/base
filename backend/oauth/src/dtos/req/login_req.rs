use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Deserialize)]
pub struct LoginReq{
    pub client_id: String,
    pub username: String,
    pub password: String,
    pub grant_type: String
}

#[derive(Debug, Serialize)]
pub struct LoginReqKeycloak{
    pub client_id: String,
    pub client_secret: String,
    pub username: String,
    pub password: String,
    pub grant_type: String
}