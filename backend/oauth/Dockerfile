# Step 1: Use the official Rust image to build the project
FROM rust:1.82 AS builder
WORKDIR /usr/src/app

# Copy manifest + lock (FALTAVA Cargo.lock)
COPY Cargo.toml ./

# Dummy src to cache deps
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Copy sources and tests
COPY src ./src
COPY tests ./tests

# (Opcional) apenas compila testes sem executar para cache mais rápido
# RUN cargo test --locked --no-run

# Executa testes (falha interrompe build)
RUN cargo test --all -- --test-threads=1

# Build release
RUN cargo build --release

# --- Coverage Stage (tarpaulin) ---
FROM rust:1.82 AS coverage
WORKDIR /usr/src/app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo fetch --locked
COPY src ./src
COPY tests ./tests

# Instalar tarpaulin
RUN cargo install cargo-tarpaulin --locked

# Rodar cobertura (engine padrão ptrace)
CMD ["cargo","tarpaulin","--workspace","--tests","--out","Html","--out","Lcov","--timeout","300","--output-dir","coverage","--fail-under","0"]

# --- Final Stage ---
FROM gcr.io/distroless/cc-debian12
WORKDIR /app
COPY --from=builder /usr/src/app/target/release/oauth .
CMD ["./oauth"]