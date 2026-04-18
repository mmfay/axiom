from fastapi import APIRouter
from app.services import auth
from app.types.auth import LoginRequest, SignupRequest

router = APIRouter()

@router.get("/me")
def get_me():
	return auth.get_me();

@router.post("/login")
async def login(data: LoginRequest):
    return await auth.login(data)

@router.post("/signup")
async def signup(data: SignupRequest):
    return await auth.signup(data)

@router.post("/logout")
def logout():
    return auth.logout()