from fastapi import Depends, HTTPException, Request, status
from jose import jwt, JWTError

from app.services.config import settings
from app.tables.Sessions import Sessions
from app.classes.apiresponse import APIResponse

async def get_current_user(request: Request) -> Sessions:

	token = request.cookies.get("sid")

	if not token:
		print("Token didn't exist.")
		APIResponse.unauthorized("Not Authenticated")

	try:
		payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
		user_id = payload.get("sid")

		if not user_id:
			print("No User ID in Sessions.")
			APIResponse.unauthorized("Invalid token.")

	except JWTError:
		APIResponse.unauthorized("Invalid token.")

	session = await Sessions.find(user_id)

	if not session:
		APIResponse.unauthorized("Session not found.")

	return session