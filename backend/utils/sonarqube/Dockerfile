# SonarQube Dockerfile
# Baseado na imagem oficial do SonarQube
FROM sonarqube:lts-community

# Configurar usuário não-root para segurança
USER root

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Criar diretórios necessários
RUN mkdir -p /opt/sonarqube/data \
    && mkdir -p /opt/sonarqube/extensions \
    && mkdir -p /opt/sonarqube/logs \
    && mkdir -p /opt/sonarqube/temp \
    && mkdir -p /opt/sonarqube/conf

# Copiar arquivos de configuração
COPY sonar.properties /opt/sonarqube/conf/sonar.properties
COPY init-sonar.sh /opt/sonarqube/bin/init-sonar.sh

# Configurar permissões
RUN chmod +x /opt/sonarqube/bin/init-sonar.sh \
    && chown -R sonarqube:sonarqube /opt/sonarqube

# Expor porta
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9000/api/system/status || exit 1

# Voltar para o usuário sonarqube
USER sonarqube

# Comando padrão
CMD ["/opt/sonarqube/bin/init-sonar.sh"] 