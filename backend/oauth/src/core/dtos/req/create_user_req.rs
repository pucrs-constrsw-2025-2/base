use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateUserReq{
    #[serde(alias="email", alias = "userName", alias="user_name", alias="user-name")]
    pub username: String,
    pub password: String,
    #[serde(alias="firstName", alias="first_name", alias="first-name")]
    pub first_name: String,
    #[serde(alias="lastName", alias="last_name", alias="last-name")]
    pub last_name: String,
}