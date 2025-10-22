#!/bin/bash

# Script de inicialização do SonarQube
# Configura o banco de dados PostgreSQL

set -e

echo "Iniciando configuração do SonarQube..."

# Aguardar PostgreSQL estar disponível
echo "Aguardando PostgreSQL estar disponível..."
until pg_isready -h postgresql -p 5432 -U postgres; do
    echo "PostgreSQL não está pronto - aguardando..."
    sleep 2
done

# Criar banco de dados e usuário se não existirem
echo "Configurando banco de dados..."
psql -h postgresql -U postgres -d postgres <<-EOSQL
    CREATE DATABASE sonar;
    CREATE USER sonar WITH PASSWORD 'sonar';
    GRANT ALL PRIVILEGES ON DATABASE sonar TO sonar;
    ALTER USER sonar CREATEDB;
EOSQL

echo "Banco de dados configurado com sucesso!"

# Iniciar SonarQube
echo "Iniciando SonarQube..."
exec /opt/sonarqube/bin/run.sh