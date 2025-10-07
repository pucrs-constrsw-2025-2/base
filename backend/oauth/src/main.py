from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Importado

from oauth_api.adapters.api.error_handler import api_exception_handler
from oauth_api.adapters.api.routes import auth, roles, users
from oauth_api.core.exceptions import BaseAPIException
from oauth_api.core.services.role_service import NotFoundError

app = FastAPI(
    title="ConstrSW - OAuth API Gateway",
    description="API Gateway para o Keycloak, implementando os requisitos do T1.",
    version="1.0.0",
)

origins = [
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(BaseAPIException, api_exception_handler)
app.add_exception_handler(NotFoundError, api_exception_handler)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)


@app.get("/", tags=["Health Check"], summary="Verifica a saúde da API")
def read_root():
    return {"status": "ok"}