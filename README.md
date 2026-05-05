# Axiom ERP

Axiom is an ERP platform built with:

- Frontend: Next.js
- Backend: FastAPI
- MCP Server: FastMCP
- Database: PostgreSQL
- Containers: Docker / Docker Compose

---

# Docker Image Build and Push

Build and push production AMD64 images to Docker Hub.

## Backend
```bash
docker buildx build --platform linux/amd64 \
-t mmfay3/axiom-backend:latest \
./backend \
--push
```

## Frontend
```bash
docker buildx build --platform linux/amd64 \
-t mmfay3/axiom-frontend:latest \
./frontend \
--push
```

## MCP Server
```bash
docker buildx build --platform linux/amd64 \
-t mmfay3/axiom-mcp:latest \
./mcp \
--push
```

---

## Build and Push All Images

Run all three:

```bash
docker buildx build --platform linux/amd64 -t mmfay3/axiom-backend:latest ./backend --push

docker buildx build --platform linux/amd64 -t mmfay3/axiom-frontend:latest ./frontend --push

docker buildx build --platform linux/amd64 -t mmfay3/axiom-mcp:latest ./mcp --push
```

---

# Docker Hub

Verify pushed images:

https://hub.docker.com/u/mmfay3

---

# Deployment

Pull latest images on server:

```bash
docker compose pull
docker compose up -d
```

Restart services:

```bash
docker compose restart
```

View running containers:

```bash
docker ps
```

View logs:

```bash
docker compose logs -f
```

---

# Local Development

Start local stack:

```bash
docker compose up --build
```

Stop stack:

```bash
docker compose down
```

---

# Notes

- Images are built for AMD64 production servers.
- Docker images should be pushed before deployment.
- Secrets are injected at runtime, not baked into images.