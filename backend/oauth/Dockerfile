# Step 1: Use the official Rust image to build the project
FROM rust:1.82 as builder

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy dependency definitions
COPY Cargo.toml Cargo.lock ./

# Step 4: Build only the dependencies to leverage Docker cache
# Create a dummy main.rs to allow dependency build
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
# Remove the dummy binary
RUN rm -f target/release/deps/oauth*

# Step 5: Copy the actual source code
COPY src ./src

# Step 6: Build the application with the actual source code
RUN cargo build --release

# --- Final Stage ---

# Step 7: Use a smaller, secure base image
FROM gcr.io/distroless/cc-debian12

# Step 8: Set the working directory
WORKDIR /app

# Step 9: Copy the built binary from the builder stage
COPY --from=builder /usr/src/app/target/release/oauth .

# Step 10: Set the command to run the application
CMD ["./oauth"]