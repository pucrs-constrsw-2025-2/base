FROM mongo:8.0.0

ARG MONGO_INITDB_ROOT_USERNAME=${MONGODB_USERNAME}
ARG MONGO_INITDB_ROOT_PASSWORD=${MONGODB_PASSWORD}

WORKDIR /docker-entrypoint-initdb.d/

# Scripts para criar os databases das APIs de backend
COPY init-mongo.js /docker-entrypoint-initdb.d/
COPY init-employees.js /docker-entrypoint-initdb.d/
COPY run-init-employees.sh /docker-entrypoint-initdb.d/

# Tornar o script executável
RUN chmod +x /docker-entrypoint-initdb.d/run-init-employees.sh
