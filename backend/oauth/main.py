from fastapi import FastAPI
from routers import roles, users

app = FastAPI()
app.include_router(roles.router)
app.include_router(users.router)
