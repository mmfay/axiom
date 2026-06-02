from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal


class GLJournalLineCreate(BaseModel):
    account_id: int
    description: Optional[str] = None
    debit: Decimal = Decimal("0")
    credit: Decimal = Decimal("0")
    dim1_value_id: Optional[int] = None
    dim2_value_id: Optional[int] = None
    dim3_value_id: Optional[int] = None
    dim4_value_id: Optional[int] = None
    dim5_value_id: Optional[int] = None


class CreateGLJournalRequest(BaseModel):
    journal_date: date
    memo: Optional[str] = None
    lines: list[GLJournalLineCreate]


class UpdateGLJournalRequest(BaseModel):
    journal_date: Optional[date] = None
    memo: Optional[str] = None
    lines: Optional[list[GLJournalLineCreate]] = None