use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateUserReq{
    #[serde(alias="email", alias = "userName", alias="user_name", alias="user-name")]
    username: String,
    password: String,
    #[serde(alias="firstName", alias="first_name", alias="first-name")]
    first_name: String,
    #[serde(alias="lastName", alias="last_name", alias="last-name")]
    last_name: String,
}