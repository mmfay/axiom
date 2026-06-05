from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.cursorpage import CursorPage, decode_cursor, encode_cursor
from app.services.ctx import get_tenant, get_company
from app.classes.apiresponse import APIResponse


@dataclass
class SLTrans(Common):

	# table fields
	id: Optional[int] = None,
	tenant_id: Optional[int] = None,
	company_id: Optional[int] = None, 
	type: Optional[str] = None,
	transaction_date: Optional[str] = None,
	reference: Optional[str] = None,
	description: Optional[str] = None,
	amount: Optional[float] = None,
	voucher: Optional[str] = None,
	created_at: Optional[str] = None,

	# table name
	table_name = "sl_transactions"

	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None, 
		type: Optional[str] = None,
		transaction_date: Optional[str] = None,
		reference: Optional[str] = None,
		description: Optional[str] = None,
		amount: Optional[float] = None,
		voucher: Optional[str] = None,
		created_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.type = type
		self.transaction_date = transaction_date
		self.reference = reference
		self.description = description
		self.amount = amount
		self.voucher = voucher
		self.created_at = created_at

	async def insert(self) -> "SLTrans":
		
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("type, transaction_date, reference, description, amount, voucher")
					.values("$1, $2, $3, $4, $5, $6")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(sql, 
							self.type, 
							self.transaction_date, 
							self.reference, 
							self.description, 
							self.amount,
							self.voucher)

		if row is None:
			APIResponse.bad_request("Invalid Insert: Row not returned")

		self.tenant_id = row["tenant_id"]
		self.company_id = row["company_id"]
		self.id = row["id"]

		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "SLTrans | None":

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.where("id = $1")
					.scoped()
				.getQuery()
		)

		row = await temp.fetch_one(sql, id)

		if row is None:
			return None

		return cls.from_row(row, connection)