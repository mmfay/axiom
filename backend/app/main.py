from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.services.db import db
from app.routers import auth, users
from app.classes.appexception import AppException
from app.classes.apiresponse import APIResponse

# starting up the database
@asynccontextmanager
async def lifespan(app: FastAPI):
	await db.startup()   
	try:
		yield
	finally:
		await db.disconnect()

def create_app() -> FastAPI:
      
	app = FastAPI(
		title="Axiom API",
		version="0.1.0",
		lifespan=lifespan,
	)

	app.add_middleware(
		CORSMiddleware,
		allow_origins=["http://localhost:3000"],
		allow_credentials=True,
		allow_methods=["*"],
		allow_headers=["*"],
	)

	@app.exception_handler(AppException)
	async def app_exception_handler(request: Request, exc: AppException):
		return APIResponse.error(
			message=exc.message,
			status_code=exc.status_code,
			data=exc.data
		)

	app.include_router(auth.router, prefix="/auth", tags=["Auth"])
	app.include_router(users.router, prefix="/users", tags=["Users"])

	@app.get("/health")
	async def health():
		return APIResponse.ok("API is healthy")

	return app

app = create_app()