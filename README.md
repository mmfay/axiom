docker buildx build --platform linux/amd64 -t mmfay3/axiom-backend:latest ./backend --push
docker buildx build --platform linux/amd64 -t mmfay3/axiom-frontend:latest ./frontend --push
docker buildx build --platform linux/amd64 -t mmfay3/axiom-mcp:latest ./mcp --push