from fastapi import APIRouter, Depends
from app.services import users
from app.services.session import get_current_user

router = APIRouter()

@router.get("/listPage")
async def get_users_list_page(cursor: str | None = None, current_user=Depends(get_current_user)):
    return await users.get_users_list_page(current_user, cursor)