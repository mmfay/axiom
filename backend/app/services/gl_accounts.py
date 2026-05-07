from app.tables import GLAccounts
from app.classes.apiresponse import APIResponse
from app.services.ctx import get_tenant, get_company
from app.types.gl_accounts import GLAccountFilters

def _fmt(a: GLAccounts) -> dict:
	return {
		"id": a.id,
		"account_number": a.account_number,
		"name": a.name,
		"account_type": a.account_type,
		"normal_balance": a.normal_balance,
		"description": a.description,
		"is_active": a.is_active,
	}

async def list_accounts(cursor: str | None, filters: GLAccountFilters):
	
	page = await GLAccounts.getAccountsPagination(cursor=cursor, filters=filters)
	return APIResponse.ok("Accounts fetched", {
		"items": [_fmt(a) for a in page.items],
		"next_cursor": page.next_cursor,
		"has_more": page.has_more,
	})

async def get_account(account_id: int):

	account = await GLAccounts.find(account_id)

	if not account:
		return APIResponse.not_found("Account not found")
	return APIResponse.ok("Account fetched", _fmt(account))

async def create_account(data):
	
	existing = await GLAccounts.findByAccountNumber(data.account_number)

	if existing:
		return APIResponse.bad_request("An account with that number already exists")
	
	account = GLAccounts(
		account_number=data.account_number,
		name=data.name,
		account_type=data.account_type,
		normal_balance=data.normal_balance,
		description=data.description,
	)
	account = await account.insert()
	
	return APIResponse.created("Account created", _fmt(account))

async def update_account(account_id: int, data):
	
	account = await GLAccounts.find(account_id)
	if not account:
		return APIResponse.not_found("Account not found")
	
	if data.account_number is not None:
		existing = await GLAccounts.findByAccountNumber(data.account_number)
		if existing and existing.id != account_id:
			APIResponse.bad_request("An account with that number already exists")
		account.account_number = data.account_number

	if data.name is not None:
		account.name = data.name
	if data.account_type is not None:
		account.account_type = data.account_type
	if data.normal_balance is not None:
		account.normal_balance = data.normal_balance
	if data.description is not None:
		account.description = data.description
	if data.is_active is not None:
		account.is_active = data.is_active

	account = await account.update()

	return APIResponse.ok("Account updated", _fmt(account))