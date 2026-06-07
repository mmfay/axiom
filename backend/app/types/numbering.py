from pydantic import BaseModel
from typing import Optional


class CreateNumberingSchemeRequest(BaseModel):
    document_type: str
    prefix: str = ""
    separator: str = "-"
    padding: int = 4
    include_year: bool = False
    include_month: bool = False
    next_value: int = 1


class UpdateNumberingSchemeRequest(BaseModel):
    prefix: Optional[str] = None
    separator: Optional[str] = None
    padding: Optional[int] = None
    include_year: Optional[bool] = None
    include_month: Optional[bool] = None
    next_value: Optional[int] = None
    is_active: Optional[bool] = None
