from fastapi import APIRouter, Depends
from app.services import roles
from app.services.session import require_permission
from app.types.roles import CreateRoleRequest, UpdateRoleRequest

router = APIRouter()

@router.get("")
async def list_roles(cursor: str | None = None, _=Depends(require_permission())):
	return await roles.list_roles(cursor)

@router.post("")
async def create_role(data: CreateRoleRequest, _=Depends(require_permission())):
	return await roles.create_role(data)

@router.patch("/{role_id}")
async def update_role(role_id: int, data: UpdateRoleRequest, _=Depends(require_permission())):
	return await roles.update_role(role_id, data)

@router.get("/{role_id}/permissions")
async def get_role_permissions(role_id: int, _=Depends(require_permission())):
	return await roles.get_role_permissions(role_id)

@router.post("/{role_id}/permissions/{permission_id}")
async def add_role_permission(role_id: int, permission_id: int, _=Depends(require_permission())):
	return await roles.add_role_permission(role_id, permission_id)

@router.delete("/{role_id}/permissions/{permission_id}")
async def remove_role_permission(role_id: int, permission_id: int, _=Depends(require_permission())):
	return await roles.remove_role_permission(role_id, permission_id)