from datetime import date
from fastapi import APIRouter, Depends
from app.services import gl_accounts, gl_dimensions, gl_account_rules, gl_reporting, gl_journals
from app.services.session import require_permission
from app.types.gl_accounts import CreateGLAccountRequest, UpdateGLAccountRequest, GLAccountFilters
from app.types.gl_dimensions import CreateGLDimensionRequest, UpdateGLDimensionRequest, CreateGLDimensionValueRequest, UpdateGLDimensionValueRequest
from app.types.gl_account_rules import CreateAccountRuleRequest, UpdateAccountRuleRequest, SetRuleValuesRequest
from app.types.gl_journals import CreateGLJournalRequest, UpdateGLJournalRequest

router = APIRouter()

@router.get("/trial-balance")
async def trial_balance(as_of: date | None = None, _=Depends(require_permission("General_ledger.Read"))):
	return await gl_reporting.get_trial_balance(as_of or date.today())

@router.get("/journals")
async def list_journals(_=Depends(require_permission("General_ledger.Read"))):
	return await gl_journals.list_journals()

@router.post("/journals")
async def create_journal(data: CreateGLJournalRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_journals.create_journal(data)

@router.get("/journals/{journal_id}")
async def get_journal(journal_id: int, _=Depends(require_permission("General_ledger.Read"))):
	return await gl_journals.get_journal(journal_id)

@router.patch("/journals/{journal_id}")
async def update_journal(journal_id: int, data: UpdateGLJournalRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_journals.update_journal(journal_id, data)

@router.post("/journals/{journal_id}/post")
async def post_journal(journal_id: int, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_journals.post_journal(journal_id)

@router.get("/accounts/all")
async def list_all_accounts(_=Depends(require_permission("General_ledger.Read"))):
	return await gl_accounts.list_all_active()

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

@router.get("/accounts/{account_id}/rules")
async def get_rules(account_id: int, _=Depends(require_permission("General_ledger.Read"))):
	return await gl_account_rules.get_rules(account_id)

@router.post("/accounts/{account_id}/rules")
async def create_rule(account_id: int, data: CreateAccountRuleRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_account_rules.create_rule(account_id, data)

@router.patch("/accounts/{account_id}/rules/{rule_id}")
async def update_rule(account_id: int, rule_id: int, data: UpdateAccountRuleRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_account_rules.update_rule(account_id, rule_id, data)

@router.delete("/accounts/{account_id}/rules/{rule_id}")
async def delete_rule(account_id: int, rule_id: int, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_account_rules.delete_rule(account_id, rule_id)

@router.patch("/accounts/{account_id}/rules/{rule_id}/values")
async def set_rule_values(account_id: int, rule_id: int, data: SetRuleValuesRequest, _=Depends(require_permission("General_ledger.Write"))):
	return await gl_account_rules.set_rule_values(account_id, rule_id, data)