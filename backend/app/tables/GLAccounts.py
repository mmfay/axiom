from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional, TYPE_CHECKING
from app.services.sql import SQL
from app.services.cursorpage import CursorPage, decode_cursor, encode_cursor
from app.services.ctx import get_tenant, get_company
from app.classes.appexception import AppException
from app.classes.apiresponse import APIResponse

if TYPE_CHECKING:
	from app.types.gl_accounts import GLAccountFilters


@dataclass
class GLAccounts(Common):

	# table fields
	id: Optional[int] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	account_number: Optional[str] = None
	name: Optional[str] = None
	account_type: Optional[str] = None
	normal_balance: Optional[str] = None
	description: Optional[str] = None
	is_active: Optional[bool] = None
	created_at: Optional[str] = None

	# table name
	table_name = "gl_accounts"

	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		account_number: Optional[str] = None,
		name: Optional[str] = None,
		account_type: Optional[str] = None,
		normal_balance: Optional[str] = None,
		description: Optional[str] = None,
		is_active: Optional[bool] = None,
		created_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.account_number = account_number
		self.name = name
		self.account_type = account_type
		self.normal_balance = normal_balance
		self.description = description
		self.is_active = is_active
		self.created_at = created_at

	async def insert(self) -> "GLAccounts":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("account_number, name, account_type, normal_balance, description")
					.values("$1, $2, $3, $4, $5")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			self.account_number,
			self.name,
			self.account_type,
			self.normal_balance,
			self.description,
		)

		if row is None:
			APIResponse.bad_request("Account was not able to be added, try again.")

		self.id = row["id"]
		self.tenant_id = row["tenant_id"]
		self.company_id = row["company_id"]
		self.is_active = row["is_active"]
		self.created_at = row["created_at"]

		return self

	async def update(self) -> "GLAccounts":

		if self.id is None:
			APIResponse.bad_request("GL Account must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("account_number = $2, name = $3, account_type = $4, normal_balance = $5, description = $6, is_active = $7")
					.where("id = $1")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			self.id,
			self.account_number,
			self.name,
			self.account_type,
			self.normal_balance,
			self.description,
			self.is_active,
		)

		if row is None:
			APIResponse.bad_request("Failed to update record")

		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "GLAccounts | None":
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.where("id = $1")
				.getQuery()
		)

		row = await temp.fetch_one(sql, id)

		if row is None:
			return None

		return cls.from_row(row, connection)

	@classmethod
	async def findByCompany(cls, company_id: int, connection=None) -> list["GLAccounts"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where("is_active = TRUE")
				.order_by("account_number")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), company_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def getAccountsPagination(
		cls,
		cursor: str | None = None,
		filters: "GLAccountFilters | None" = None,
		connection=None,
	) -> CursorPage:
		temp = cls(connection=connection)
		page_lines = 25

		last_id = 0
		if cursor:
			try:
				payload = decode_cursor(cursor)
				last_id = int(payload.get("id", 0))
			except Exception:
				APIResponse.bad_request("Issue with Pages, refresh and try again.")

		params: list = [last_id]

		builder = (
			SQL()
				.select(cls.table_name)
				.columns("id", "account_number", "name", "account_type", "normal_balance", "description", "is_active")
				.where("id > $1")
				.scoped()
		)

		if filters:
			if filters.account_number:
				params.append(f"%{filters.account_number}%")
				builder.where(f"account_number ILIKE ${len(params)}")

			if filters.name:
				params.append(f"%{filters.name}%")
				builder.where(f"name ILIKE ${len(params)}")

			if filters.account_type:
				params.append(filters.account_type)
				builder.where(f"account_type = ${len(params)}")

			if filters.is_active is not None:
				params.append(filters.is_active)
				builder.where(f"is_active = ${len(params)}")

		params.append(page_lines + 1)
		sql = builder.order_by("account_number").limit(f"${len(params)}").getQuery()

		rows = await temp.fetch_all(sql, *params)

		has_more = len(rows) > page_lines
		rows = rows[:page_lines]

		items = [cls.from_row(r, connection) for r in rows]

		next_cursor = None
		if has_more:
			next_cursor = encode_cursor({"id": dict(rows[-1])["id"]})

		return CursorPage(items=items, next_cursor=next_cursor, has_more=has_more)

	@classmethod
	async def findByAccountNumber(cls, account_number: str, connection=None) -> "GLAccounts | None":

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("account_number = $1")
				.scoped()
			.getQuery()
		)

		row = await temp.fetch_one(sql, account_number)

		if row is None:
			return None

		return cls.from_row(row, connection)