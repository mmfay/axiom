from fastapi import APIRouter, Depends
from app.services import gl_accounts
from app.services.session import require_permission
from app.types.gl_accounts import CreateGLAccountRequest, UpdateGLAccountRequest

router = APIRouter()

@router.get("")
async def list_accounts(
	cursor: str | None = None,
	account_number: str | None = None,
	name: str | None = None,
	account_type: str | None = None,
	is_active: bool | None = None,
	_=Depends(require_permission("General_ledger.Read")),
):
	return await gl_accounts.list_accounts(
		cursor,
		account_number=account_number,
		name=name,
		account_type=account_type,
		is_active=is_active,
	)

@router.get("/{account_id}")
async def get_account(account_id: int, _=Depends(require_permission("General_ledger.Read"))):
	return await gl_accounts.get_account(account_id)

@router.post("")
async def create_account(data: CreateGLAccountRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_accounts.create_account(data)

@router.patch("/{account_id}")
async def update_account(account_id: int, data: UpdateGLAccountRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_accounts.update_account(account_id, data)
