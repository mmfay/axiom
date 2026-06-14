from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.cursorpage import CursorPage, decode_cursor, encode_cursor
from app.services.ctx import get_tenant, get_company
from app.classes.appexception import AppException


@dataclass
class Users(Common):

	# table fields
	id: Optional[int] = None
	version_id: Optional[int] = None
	email: Optional[str] = None
	user_id: Optional[str] = None
	password: Optional[str] = None
	is_enabled: Optional[bool] = None
	tenant_id: Optional[int] = None
	default_company_id: Optional[int] = None
	default_role_id: Optional[int] = None

	# table name
	table_name = "users"

	def __init__(
		self,
		id: Optional[int] = None,
		version_id: Optional[int] = None,
		email: Optional[str] = None,
		user_id: Optional[str] = None,
		password: Optional[str] = None,
		is_enabled: Optional[bool] = None,
		tenant_id: Optional[int] = None,
		default_company_id: Optional[int] = None,
		default_role_id: Optional[int] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.version_id = version_id
		self.email = email
		self.user_id = user_id
		self.password = password
		self.is_enabled = is_enabled
		self.tenant_id = tenant_id
		self.default_company_id = default_company_id
		self.default_role_id = default_role_id

	async def insert(self) -> "Users":
		
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("email, password, user_id, tenant_id, default_company_id")
					.values("$1, $2, $3, $4, $5")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, self.email, self.password, self.user_id, get_tenant(), get_company())

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.version_id = row["version_id"]
		self.id = row["id"]

		return self

	async def update(self) -> "Users":

		if self.id is None:
			raise ValueError("User must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("version_id=$2+1, email=$4, password=$5, is_enabled=$6, default_role_id=$7, default_company_id=$8")
					.where("tenant_id = $1 AND version_id = $2 AND id = $3")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, get_tenant(), self.version_id, self.id, self.email, self.password, self.is_enabled, self.default_role_id, self.default_company_id)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		self.version_id = row["version_id"]

		return self

	async def delete(self) -> None:

		sql = (
			SQL()
				.delete(self.table_name)
					.where("tenant_id = $1")
					.where("id = $2")
				.getQuery()
		)

		await self.execute(sql, get_tenant(), self.id)

	@classmethod
	async def find(cls, id: int, connection=None) -> "Users | None":

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("id = $2")
			.getQuery()
		)

		row = await temp.fetch_one(sql, get_tenant(), id)

		if row is None:
			return None

		return cls.from_row(row, connection)

	@classmethod
	async def findByEmail(cls, email: str, connection=None) -> "Users | None":

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("email = $1")
			.getQuery()
		)

		row = await temp.fetch_one(sql, email)

		if row is None:
			return None

		return cls.from_row(row, connection)

	@classmethod
	async def findByUserID(cls, user_id: str, connection=None) -> "Users | None":
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("user_id = $2")
			.getQuery()
		)

		row = await temp.fetch_one(sql, get_tenant(), user_id)

		if row is None:
			return None

		return cls.from_row(row, connection)

	@classmethod
	async def findByTenant(cls, connection=None) -> list["Users"]:

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
	async def findAll(cls, connection=None) -> list["Users"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.columns("id", "email")
					.order_by("email")
					.scoped(company=False)
				.getQuery()
		)

		rows = await temp.fetch_all(sql)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def getUserPagination(cls, cursor: str | None = None, email: str | None = None, user_id: str | None = None, is_enabled: bool | None = None, connection=None) -> CursorPage:

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
				.columns("email", "user_id", "id", "is_enabled")
				.where("tenant_id = $1")
				.where("id > $2")
		)

		if email:
			params.append(f"%{email}%")
			builder.where(f"email ILIKE ${len(params)}")

		if user_id:
			params.append(f"%{user_id}%")
			builder.where(f"user_id ILIKE ${len(params)}")

		if is_enabled is not None:
			params.append(is_enabled)
			builder.where(f"is_enabled = ${len(params)}")

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