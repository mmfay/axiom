from pydantic import BaseModel
from typing import Optional


class CreateAccountRuleRequest(BaseModel):
	dimension_id: int
	is_required: bool = False
	parent_value_id: Optional[int] = None
	allowed_value_ids: list[int] = []


class UpdateAccountRuleRequest(BaseModel):
	is_required: bool


class SetRuleValuesRequest(BaseModel):
	value_ids: list[int]
