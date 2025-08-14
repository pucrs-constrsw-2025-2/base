use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct LoginReq{
    pub client_id: String,
    pub username: String,
    pub password: String,
    pub grant_type: String
}