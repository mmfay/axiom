from pydantic import BaseModel
from typing import Optional

class CreateRoleRequest(BaseModel):
	name: str
	description: Optional[str] = None

class UpdateRoleRequest(BaseModel):
	name: Optional[str] = None
	description: Optional[str] = None
