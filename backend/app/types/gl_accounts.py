from pydantic import BaseModel
from fastapi import Query
from typing import Optional
from enum import Enum

class AccountType(str, Enum):
	asset = "Asset"
	liability = "Liability"
	equity = "Equity"
	revenue = "Revenue"
	expense = "Expense"

class NormalBalance(str, Enum):
	debit = "debit"
	credit = "credit"

class CreateGLAccountRequest(BaseModel):
	account_number: str
	name: str
	account_type: AccountType
	normal_balance: NormalBalance
	description: Optional[str] = None

class UpdateGLAccountRequest(BaseModel):
	account_number: Optional[str] = None
	name: Optional[str] = None
	account_type: Optional[AccountType] = None
	normal_balance: Optional[NormalBalance] = None
	description: Optional[str] = None
	is_active: Optional[bool] = None

class GLAccountFilters(BaseModel):
	account_number: Optional[str] = Query(default=None)
	name: Optional[str] = Query(default=None)
	account_type: Optional[str] = Query(default=None)
	is_active: Optional[bool] = Query(default=None)
