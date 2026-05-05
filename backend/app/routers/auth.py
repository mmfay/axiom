from fastapi import APIRouter, Depends
from jose import jwt
from datetime import datetime, timedelta, timezone
from app.classes.apiresponse import APIResponse
from app.services import auth
from app.services.session import get_current_user
from app.types.auth import LoginRequest, SignupRequest, UserEmail, ResetPassword, Token, SetRoleRequest, SetCompanyRequest, SetDefaultRoleRequest
from app.services.config import settings
from app.tables import Sessions

router = APIRouter()

@router.get("/me")
async def get_me(_=Depends(get_current_user)):
	return await auth.get_me()

@router.post("/login")
async def login(data: LoginRequest):

	user = await auth.login(data)

	# create a session, pre-loading the user's default role if set
	session = Sessions(
		user_id=user.user_id,
		email=user.email,
		company_id=user.default_company_id,
		tenant_id=user.tenant_id,
		active_role_id=user.default_role_id,
		expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
	)

	session = await session.insert()

	payload = {
		"sid": session.id,
		"exp": session.expires_at
	}

	token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

	res = APIResponse.ok("Login Successful")

	res.set_cookie(
		key="sid",
		value=token,
		httponly=True,
		secure=settings.IS_PROD,
		samesite="lax",
		max_age=60*60,
		path="/"
	)

	return res

@router.post("/signup")
async def signup(data: SignupRequest):
	return await auth.signup(data)

@router.post("/forgot-password")
async def forgotPassword(data: UserEmail):
	return await auth.forgotPassword(data)

@router.post("/reset-password")
async def resetPassword(data: ResetPassword):
	return await auth.resetPassword(data)

@router.post("/verify-account")
async def verifyAccount(data: Token):
	return await auth.verifyAccount(data)

@router.post("/set-company")
async def set_company(data: SetCompanyRequest, _=Depends(get_current_user)):
	return await auth.set_company(data.company_id)

@router.post("/set-role")
async def set_role(data: SetRoleRequest, _=Depends(get_current_user)):
	return await auth.set_role(data.role_id)

@router.post("/set-default-role")
async def set_default_role(data: SetDefaultRoleRequest, _=Depends(get_current_user)):
	return await auth.set_default_role(data.role_id)

@router.post("/logout")
def logout():

	res = APIResponse.ok("Logged out")

	res.delete_cookie(
		key="sid",
		httponly=True,
		secure=False,
		samesite="lax",
	)

	return res