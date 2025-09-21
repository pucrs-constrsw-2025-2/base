# Etapa de build
FROM golang:1.23 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o app ./cmd/server

# Imagem final
FROM debian:bullseye-slim

WORKDIR /app
COPY --from=builder /app/app .

EXPOSE 8181

CMD ["./app"]