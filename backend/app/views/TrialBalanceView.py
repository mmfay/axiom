from datetime import date as Date
from dataclasses import dataclass
from typing import Optional
from app.tables.Common import Common
from app.services.sql import SQL
from app.services.ctx import get_tenant, get_company


@dataclass
class TrialBalanceView(Common):

    account_number: Optional[str] = None
    name: Optional[str] = None
    account_type: Optional[str] = None
    total_debit: Optional[float] = None
    total_credit: Optional[float] = None

    view_name = "vw_trial_balance"

    def __init__(
        self,
        account_number: Optional[str] = None,
        name: Optional[str] = None,
        account_type: Optional[str] = None,
        total_debit: Optional[float] = None,
        total_credit: Optional[float] = None,
        connection=None,
    ):
        super().__init__(connection)
        self.account_number = account_number
        self.name = name
        self.account_type = account_type
        self.total_debit = total_debit
        self.total_credit = total_credit

    @classmethod
    async def find(cls, as_of: Date, connection=None) -> list["TrialBalanceView"]:
        temp = cls(connection=connection)

        sql = (
            SQL()
            	.select(cls.view_name)
					.columns(
						"account_number",
						"name",
						"account_type",
						"COALESCE(SUM(debit),  0) AS total_debit",
						"COALESCE(SUM(credit), 0) AS total_credit",
					)
            	.scoped()
            	.where("(transaction_date IS NULL OR transaction_date <= $1)")
            	.group_by("account_number, name, account_type")
            	.having("COALESCE(SUM(debit), 0) > 0 OR COALESCE(SUM(credit), 0) > 0")
            	.order_by("account_number")
            	.getQuery()
        )

        rows = await temp.fetch_all(sql, as_of)
        
        return [cls.from_row(row, connection) for row in rows]
