from fastapi import FastAPI
from oauth_api.adapters.api.routes import auth, users, roles
from oauth_api.adapters.api.error_handler import api_exception_handler
from oauth_api.core.exceptions import BaseAPIException
from oauth_api.core.services.role_service import NotFoundError

app = FastAPI(
    title="ConstrSW - OAuth API Gateway",
    description="API Gateway para o Keycloak, implementando os requisitos do T1.",
    version="1.0.0",
)

app.add_exception_handler(BaseAPIException, api_exception_handler)
app.add_exception_handler(NotFoundError, api_exception_handler)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)


@app.get("/", tags=["Health Check"], summary="Verifica a saúde da API")
def read_root():
    return {"status": "ok"}
