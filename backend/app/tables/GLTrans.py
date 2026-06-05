from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.cursorpage import CursorPage, decode_cursor, encode_cursor
from app.services.ctx import get_tenant, get_company
from app.classes.apiresponse import APIResponse


@dataclass
class GLTrans(Common):

	# table fields
	id: Optional[int] = None,
	tenant_id: Optional[int] = None,
	company_id: Optional[int] = None, 
	transaction_date: Optional[str] = None,
	account_id: Optional[int] = None,
	description: Optional[str] = None,
	debit: Optional[float] = None,
	credit: Optional[float] = None,
	dim1_value_id: Optional[int] = None,
	dim2_value_id: Optional[int] = None,
	dim3_value_id: Optional[int] = None,
	dim4_value_id: Optional[int] = None,
	dim5_value_id: Optional[int] = None,
	voucher: Optional[str] = None,
	created_at: Optional[str] = None,

	# table name
	table_name = "gl_transactions"

	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None, 
		transaction_date: Optional[str] = None,
		account_id: Optional[int] = None,
		description: Optional[str] = None,
		debit: Optional[float] = None,
		credit: Optional[float] = None,
		dim1_value_id: Optional[int] = None,
		dim2_value_id: Optional[int] = None,
		dim3_value_id: Optional[int] = None,
		dim4_value_id: Optional[int] = None,
		dim5_value_id: Optional[int] = None,
		voucher: Optional[int] = None,
		created_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.transaction_date = transaction_date
		self.account_id = account_id
		self.description = description
		self.debit = debit
		self.credit = credit
		self.dim1_value_id = dim1_value_id
		self.dim2_value_id = dim2_value_id
		self.dim3_value_id = dim3_value_id
		self.dim4_value_id = dim4_value_id
		self.dim5_value_id = dim5_value_id
		self.voucher = voucher
		self.created_at = created_at

	async def insert(self) -> "GLTrans":
		
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, dim3_value_id, dim4_value_id, dim5_value_id, voucher")
					.values("$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(sql, 
							self.transaction_date,
							self.account_id,
							self.description,
							self.debit,
							self.credit,
							self.dim1_value_id,
							self.dim2_value_id,
							self.dim3_value_id,
							self.dim4_value_id,
							self.dim5_value_id,
							self.voucher)

		if row is None:
			APIResponse.bad_request("Insert Failed: Row not returned")

		self.id = row["id"]

		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "GLTrans | None":

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