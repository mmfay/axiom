from fastapi import APIRouter, Depends
from app.services import gl_accounts, gl_dimensions
from app.services.session import require_permission
from app.types.gl_accounts import CreateGLAccountRequest, UpdateGLAccountRequest, GLAccountFilters
from app.types.gl_dimensions import CreateGLDimensionRequest, UpdateGLDimensionRequest, CreateGLDimensionValueRequest, UpdateGLDimensionValueRequest

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

@router.get("/dimensions")
async def list_dimensions(_=Depends(require_permission("General_ledger.Read"))):
	return await gl_dimensions.list_dimensions()

@router.post("/dimensions")
async def create_dimension(data: CreateGLDimensionRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_dimensions.create_dimension(data)

@router.patch("/dimensions/{dimension_id}")
async def update_dimension(dimension_id: int, data: UpdateGLDimensionRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_dimensions.update_dimension(dimension_id, data)

@router.get("/dimensions/{dimension_id}/values")
async def list_values(dimension_id: int, _=Depends(require_permission("General_ledger.Read"))):
	return await gl_dimensions.list_values(dimension_id)

@router.post("/dimensions/{dimension_id}/values")
async def create_value(dimension_id: int, data: CreateGLDimensionValueRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_dimensions.create_value(dimension_id, data)

@router.patch("/dimensions/{dimension_id}/values/{value_id}")
async def update_value(dimension_id: int, value_id: int, data: UpdateGLDimensionValueRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_dimensions.update_value(dimension_id, value_id, data)