#!/bin/sh
set -eu
: "${SONAR_HOST_URL:?}"
: "${SONAR_TOKEN:?}"

# Pode ser: backend/oauth (se rodar de base), oauth (se rodar de backend), ou . (se rodar dentro do crate)
RUST_DIR="${RUST_DIR:-backend/oauth}"

# Auto-ajustes
if [ ! -d "$RUST_DIR/src" ] && [ -d oauth/src ]; then
  RUST_DIR="oauth"
fi
if [ ! -d "$RUST_DIR/src" ] && [ -d src ] && [ -f Cargo.toml ]; then
  RUST_DIR="."
fi
[ -d "$RUST_DIR/src" ] || { echo "[ERRO] Não encontrei '$RUST_DIR/src'"; exit 1; }

echo "[INFO] Crate: $RUST_DIR"

(
  cd "$RUST_DIR"
  echo "[INFO] Gerando cobertura..."
  cargo llvm-cov --lcov --output-path lcov.info
  echo "[INFO] Clippy..."
  cargo clippy --message-format=json > clippy.json || true
)

# Normaliza forma do caminho para sonar (não alteramos SF; mantemos igual aos paths reais)
SONAR_SOURCES="$RUST_DIR/src"
SONAR_TESTS="$RUST_DIR/tests"

cat > sonar-project.properties <<EOF
sonar.projectKey=oauth
sonar.projectName=oauth
sonar.host.url=${SONAR_HOST_URL}
sonar.sourceEncoding=UTF-8
sonar.sources=${SONAR_SOURCES}
sonar.exclusions=**/target/**
sonar.tests=${SONAR_TESTS}
sonar.test.inclusions=${SONAR_TESTS}/**/*.rs
sonar.rust.lcov.reportPaths=${RUST_DIR}/lcov.info
sonar.rust.clippy.reportPaths=${RUST_DIR}/clippy.json
sonar.rust.cargo.manifestPaths=${RUST_DIR}/Cargo.toml
sonar.scm.provider=git
EOF

echo "[INFO] Executando sonar-scanner..."
exec sonar-scanner -Dsonar.token="${SONAR_TOKEN}" "$@"