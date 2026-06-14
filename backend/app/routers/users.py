from fastapi import APIRouter, Depends
from app.services import users
from app.services.session import require_permission
from app.types.auth import CreateUserRequest, UpdateUserRequest

router = APIRouter()

@router.post("")
async def create_user(data: CreateUserRequest, _=Depends(require_permission())):
	return await users.create_user(data)

@router.delete("/{rec_id}")
async def delete_user(rec_id: int, _=Depends(require_permission())):
	return await users.delete_user(rec_id)

@router.patch("/{rec_id}")
async def update_user(rec_id: int, data: UpdateUserRequest, _=Depends(require_permission())):
	return await users.update_user(rec_id, data)

@router.get("/{rec_id}/roles")
async def get_user_roles(rec_id: int, _=Depends(require_permission())):
	return await users.get_user_roles(rec_id)

@router.post("/{rec_id}/roles/{role_id}")
async def add_user_role(rec_id: int, role_id: int, _=Depends(require_permission())):
	return await users.add_user_role(rec_id, role_id)

@router.delete("/{rec_id}/roles/{role_id}")
async def remove_user_role(rec_id: int, role_id: int, _=Depends(require_permission())):
	return await users.remove_user_role(rec_id, role_id)

@router.get("/all")
async def list_all_users(_=Depends(require_permission())):
	return await users.list_all_users()

@router.get("/listPage")
async def get_users_list_page(
	cursor: str | None = None,
	email: str | None = None,
	user_id: str | None = None,
	is_enabled: bool | None = None,
	_=Depends(require_permission()),
):
	return await users.get_users_list_page(cursor, email=email, user_id=user_id, is_enabled=is_enabled)