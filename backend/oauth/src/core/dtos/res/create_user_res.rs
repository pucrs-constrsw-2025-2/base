use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRes{
    pub id: String,
    
    #[serde(alias="email", alias = "userName", alias="user_name", alias="user-name")]
    pub username: String,

    #[serde(rename="first-name",
        alias="firstName", alias="first_name", alias="first-name")]
    pub first_name: String,

    #[serde(rename="last-name",
        alias="lastName", alias="last_name", alias="last-name")]
    pub last_name: String,

    pub enabled: bool
}