from fastapi import APIRouter, Depends
from app.services import users
from app.services.session import get_current_user
from app.types.auth import CreateUserRequest, UpdateUserRequest

router = APIRouter()

@router.post("")
async def create_user(data: CreateUserRequest, current_user=Depends(get_current_user)):
	return await users.create_user(current_user, data)

@router.patch("/{rec_id}")
async def update_user(rec_id: int, data: UpdateUserRequest, current_user=Depends(get_current_user)):
	return await users.update_user(current_user, rec_id, data)

@router.get("/{rec_id}/roles")
async def get_user_roles(rec_id: int, current_user=Depends(get_current_user)):
	return await users.get_user_roles(current_user, rec_id)

@router.post("/{rec_id}/roles/{role_id}")
async def add_user_role(rec_id: int, role_id: int, current_user=Depends(get_current_user)):
	return await users.add_user_role(current_user, rec_id, role_id)

@router.delete("/{rec_id}/roles/{role_id}")
async def remove_user_role(rec_id: int, role_id: int, current_user=Depends(get_current_user)):
	return await users.remove_user_role(current_user, rec_id, role_id)

@router.get("/listPage")
async def get_users_list_page(cursor: str | None = None, current_user=Depends(get_current_user)):
    return await users.get_users_list_page(current_user, cursor)