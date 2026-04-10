from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, users


def create_app() -> FastAPI:
    app = FastAPI(
        title="Axiom API",
        version="0.1.0"
    )

    # --- Middleware ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  # Next.js frontend
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Routers ---
    app.include_router(auth.router, prefix="/auth", tags=["Auth"])
    app.include_router(users.router, prefix="/users", tags=["Users"])

    # --- Health Check ---
    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()