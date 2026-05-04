from fastapi import Depends, Request
from jose import jwt, JWTError

from app.services.config import settings
from app.services.ctx import set_user, get_user
from app.tables import Sessions, Roles, Permissions, RolePermissions
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

	set_user(session)
	
	return session

def require_permission(permission: str | None = None):

	async def _dependency(_=Depends(get_current_user)):

		session = get_user()

		role = await Roles.find(session.active_role_id) if session.active_role_id else None

		if not role:
			APIResponse.forbidden("No active role")

		if role.name == "sysadmin":
			return

		if permission is None:
			APIResponse.forbidden("Requires 'sysadmin' role")

		perm = await Permissions.findByName(permission)

		if not perm:
			APIResponse.forbidden(f"Unknown permission '{permission}'")

		assignments = await RolePermissions.findByRole(role.id)

		if not any(a.permission_id == perm.id for a in assignments):
			APIResponse.forbidden(f"Requires '{permission}' permission")

	return _dependency