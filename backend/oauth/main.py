from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from routers import roles, users
from exceptions import APIException

app = FastAPI()


@app.exception_handler(APIException)
async def service_exception_handler(request: Request, exc: APIException):
    """
    Captura as exceções da camada de serviço e as formata na resposta JSON padrão.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "error_description": exc.description,
            "error_source": exc.source,
            "error_stack": [
                {
                    "code": exc.error_code,
                    "description": exc.description,
                    "source": exc.source,
                }
            ],
        },
    )


app.include_router(roles.router)
app.include_router(users.router)
