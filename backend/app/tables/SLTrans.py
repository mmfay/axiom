from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.cursorpage import CursorPage, decode_cursor, encode_cursor
from app.services.ctx import get_tenant, get_company
from app.classes.appexception import AppException


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
					.fields("tenant_id, company_id, type, transaction_date, reference, description, amount, voucher")
					.values("$1, $2, $3, $4, $5, $6, $7, $8")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(sql, 
							get_tenant(), 
							get_company(), 
							self.type, 
							self.transaction_date, 
							self.reference, 
							self.description, 
							self.amount,
							self.voucher)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

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
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where("id = $3")
			.getQuery()
		)

		row = await temp.fetch_one(sql, get_tenant(), get_company(), id)

		if row is None:
			return None

		return cls.from_row(row, connection)

	@classmethod
	async def findByTenant(cls, connection=None) -> list["SLTrans"]:

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant())

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def findByCompany(cls, connection=None) -> list["SLTrans"]:

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), get_company())

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def getPagination(cls, cursor: str | None = None, email: str | None = None, user_id: str | None = None, is_enabled: bool | None = None, connection=None) -> CursorPage:

		temp = cls(connection=connection)

		page_lines = 2

		last_id = 0
		
		if cursor:
			try:
				payload = decode_cursor(cursor)
				last_id = int(payload.get("id", 0))
			except Exception:
				raise AppException(400, "Invalid cursor")

		params: list = [get_tenant(), last_id]

		builder = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("id > $2")
		)

		params.append(page_lines + 1)
		sql = builder.order_by("id").limit(f"${len(params)}").getQuery()

		rows = await temp.fetch_all(sql, *params)

		has_more = len(rows) > page_lines
		rows = rows[:page_lines]

		items = [cls.from_row(r, connection) for r in rows]

		next_cursor = None
		if has_more:
			next_cursor = encode_cursor({"id": dict(rows[-1])["id"]})

		return CursorPage(items=items, next_cursor=next_cursor, has_more=has_more)