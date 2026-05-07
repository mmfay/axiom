from fastapi import APIRouter, Depends
from app.services import gl_accounts
from app.services.session import require_permission
from app.types.gl_accounts import CreateGLAccountRequest, UpdateGLAccountRequest, GLAccountFilters

router = APIRouter()

@router.get("/accounts")
async def list_accounts(
	cursor: str | None = None,
	filters: GLAccountFilters = Depends(),
	_=Depends(require_permission("General_ledger.Read")),
):
	return await gl_accounts.list_accounts(cursor, filters)

@router.get("/accounts/{account_id}")
async def get_account(account_id: int, _=Depends(require_permission("General_ledger.Read"))):
	return await gl_accounts.get_account(account_id)

@router.post("/accounts")
async def create_account(data: CreateGLAccountRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_accounts.create_account(data)

@router.patch("/accounts/{account_id}")
async def update_account(account_id: int, data: UpdateGLAccountRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_accounts.update_account(account_id, data)