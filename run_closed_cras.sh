#!/bin/bash
# base
# Repositório base da aplicação Closed CRAS

echo "Criando volumes do Docker..."

docker volume create constrsw-sonarqube-data
docker volume create constrsw-sonarqube-extensions
docker volume create constrsw-sonarqube-logs
docker volume create constrsw-postgresql-data
docker volume create constrsw-keycloak-data

echo "Subindo containers com docker compose..."
docker compose up

# chmod +x run_closed_cras.sh
