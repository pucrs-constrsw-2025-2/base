use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateUserReq{
    username: String,
    first_name: String,
    last_name: String,
    email: String
}