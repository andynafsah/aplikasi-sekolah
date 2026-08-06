# Multi-stage build for Enterprise ERP Pesantren Full-stack App
# ------------------------------------------------------------
# Stage 1: Build & Compiles static assets + backend bundles
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install all dependencies (including devDependencies for compiling)
RUN npm ci

# Copy full source codebase
COPY . .

# Compile Frontend & Backend bundles
RUN npm run build

# ------------------------------------------------------------
# Stage 2: Clean Production Runner Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency definition files
COPY package*.json ./

# Install only production dependencies to minimize image size
RUN npm ci --omit=dev

# Copy compiled build artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000 (standard reverse-proxy entrypoint)
EXPOSE 3000

# Run the compiled backend controller-service CJS server
CMD ["node", "dist/server.cjs"]
