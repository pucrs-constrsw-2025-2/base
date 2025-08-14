import os


KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")  # Exemplo: http://localhost:8080
REALM_NAME = os.getenv("REALM_NAME")  # Exemplo: constrsw
CLIENT_ID = os.getenv("CLIENT_ID")  # Exemplo: oauth
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
