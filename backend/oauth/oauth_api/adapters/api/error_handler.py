from fastapi import Request
from fastapi.responses import JSONResponse

from oauth_api.core.exceptions import BaseAPIException


def api_exception_handler(_: Request, exc: BaseAPIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "error_description": exc.description,
            "error_source": "OAuthAPI",
            "error_stack": exc.error_stack,
        },
    )
