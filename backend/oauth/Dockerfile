# Step 1: Use the official Rust image to build the project
FROM rust:1.82 as builder

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/myapp

# Step 3: Copy the Cargo.toml and Cargo.lock files
COPY Cargo.toml ./

# Step 4: Create a new directory for the application code
RUN mkdir src && echo "fn main() { println!(\"Hello, world!\"); }" > src/main.rs

# Step 5: Copy the source code into the container
COPY src/ src/

# Step 6: Build the application
RUN cargo build --release

# Step 7: Use a smaller base image for the final image
FROM ubuntu:22.04

# Step 8: Copy the built binary from the builder image
COPY --from=builder /usr/src/myapp/target/release/oauth /usr/local/bin/

# Step 9: Set the command to run the application
CMD ["oauth"]