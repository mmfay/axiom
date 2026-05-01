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

@router.get("/listPage")
async def get_users_list_page(cursor: str | None = None, current_user=Depends(get_current_user)):
    return await users.get_users_list_page(current_user, cursor)