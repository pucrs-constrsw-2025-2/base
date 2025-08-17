use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct LoginRes{
    pub token_type: String,
    pub access_token: String,
    pub expires_in: u16,
    pub refresh_token: String,
    pub refresh_expires_in: u16
}

#[derive(Debug, Deserialize)]
pub struct LoginResKeycloak{
    pub access_token: String,
    pub expires_in: u16,
    pub refresh_expires_in: u16,
    pub refresh_token: String,
    pub token_type: String,
    pub not-before-policy: u16,
    pub session_state: String,
    pub scope: String
}