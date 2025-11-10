from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.sdk.resources import Resource
import os

from src.adapters.api.error_handler import api_exception_handler
from src.adapters.api.routes import auth, roles, users
from src.core.exceptions import BaseAPIException
from src.core.services.role_service import NotFoundError

# Configurar OpenTelemetry
resource = Resource.create({
    "service.name": os.getenv("OTEL_SERVICE_NAME", "oauth"),
    "service.version": "1.0.0",
})

# Configurar Tracer
trace.set_tracer_provider(TracerProvider(resource=resource))

# Configurar Métricas com exportador Prometheus
prometheus_reader = PrometheusMetricReader()
metrics.set_meter_provider(MeterProvider(resource=resource, metric_readers=[prometheus_reader]))

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

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(roles.router, prefix="/api/v1")

# Instrumentar FastAPI e HTTPX com OpenTelemetry
FastAPIInstrumentor.instrument_app(app)
HTTPXClientInstrumentor().instrument()

# Endpoint de health check padronizado (formato compatível com Actuator)
@app.get("/health")
async def health():
    """
    Health check endpoint padronizado.
    Retorna formato compatível com Spring Boot Actuator.
    """
    return {
        "status": "UP",
        "components": {
            "service": {
                "status": "UP",
                "details": {
                    "name": "oauth",
                    "version": "1.0.0"
                }
            }
        }
    }

# Endpoint para expor métricas Prometheus
@app.get("/metrics")
async def metrics_endpoint():
    from prometheus_client import CONTENT_TYPE_LATEST
    # O PrometheusMetricReader na versão 0.42b0 não expõe HTTP diretamente
    # Precisamos coletar as métricas manualmente
    try:
        # Coletar métricas do reader
        metrics_data = prometheus_reader.get_metrics_data()
        # Converter para formato Prometheus
        from prometheus_client import generate_latest
        return Response(content=generate_latest(metrics_data), media_type=CONTENT_TYPE_LATEST)
    except AttributeError:
        # Se não tiver get_metrics_data, tentar outra abordagem
        try:
            # Tentar usar o método collect do reader
            metrics_data = prometheus_reader.collect()
            return Response(content=metrics_data, media_type=CONTENT_TYPE_LATEST)
        except Exception:
            # Fallback: retornar métricas vazias
            return Response(content="# No metrics available\n", media_type=CONTENT_TYPE_LATEST)