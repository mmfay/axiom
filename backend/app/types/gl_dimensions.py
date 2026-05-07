from pydantic import BaseModel
from typing import Optional


class CreateGLDimensionRequest(BaseModel):
	slot: int
	name: str
	is_active: bool = True


class UpdateGLDimensionRequest(BaseModel):
	name: Optional[str] = None
	is_active: Optional[bool] = None


class CreateGLDimensionValueRequest(BaseModel):
	code: str
	name: str


class UpdateGLDimensionValueRequest(BaseModel):
	code: Optional[str] = None
	name: Optional[str] = None
	is_active: Optional[bool] = None
