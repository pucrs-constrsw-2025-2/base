FROM rust:1.82-slim AS scanner

ARG SONAR_SCANNER_VERSION=5.0.1.3006
ENV DEBIAN_FRONTEND=noninteractive \
    SONAR_SCANNER_HOME=/opt/sonar-scanner \
    PATH=/opt/sonar-scanner/bin:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl unzip ca-certificates openjdk-17-jre-headless git pkg-config libssl-dev build-essential bash dos2unix \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip" -o /tmp/ss.zip \
  && unzip /tmp/ss.zip -d /opt \
  && mv /opt/sonar-scanner-* "$SONAR_SCANNER_HOME" \
  && rm /tmp/ss.zip \
  && sed -i 's/use_embedded_jre=true/use_embedded_jre=false/' $SONAR_SCANNER_HOME/bin/sonar-scanner

RUN rustup component add clippy llvm-tools-preview && cargo install cargo-llvm-cov --locked

WORKDIR /workspace
COPY run-sonar.sh /usr/local/bin/run-sonar
RUN dos2unix /usr/local/bin/run-sonar || true \
 && chmod +x /usr/local/bin/run-sonar

ENTRYPOINT ["/usr/local/bin/run-sonar"]