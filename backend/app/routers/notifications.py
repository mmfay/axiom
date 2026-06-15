from fastapi import APIRouter, Depends
from app.services import notifications
from app.services.session import require_permission

router = APIRouter()

@router.get("")
async def get_unread(_=Depends(require_permission())):
	return await notifications.get_unread()

@router.patch("/{notification_id}/read")
async def mark_read(notification_id: int, _=Depends(require_permission())):
	return await notifications.mark_read(notification_id)

@router.post("/read-all")
async def mark_all_read(_=Depends(require_permission())):
	return await notifications.mark_all_read()