from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.cursorpage import CursorPage, decode_cursor, encode_cursor
from app.services.ctx import get_tenant
from app.classes.appexception import AppException


@dataclass
class Roles(Common):

	# table fields
	id: Optional[int] = None
	tenant_id: Optional[int] = None
	name: Optional[str] = None
	description: Optional[str] = None
	created_at: Optional[str] = None

	# table name
	table_name = "roles"

	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		name: Optional[str] = None,
		description: Optional[str] = None,
		created_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.name = name
		self.description = description
		self.created_at = created_at

	async def insert(self) -> "Roles":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("tenant_id, name, description")
					.values("$1, $2, $3")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, get_tenant(), self.name, self.description)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.id = row["id"]
		self.tenant_id = row["tenant_id"]
		self.created_at = row["created_at"]

		return self

	async def update(self) -> "Roles":

		if self.id is None:
			raise ValueError("Role must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("name = $1, description = $2")
					.where("id = $3")
					.where("tenant_id = $4")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, self.name, self.description, self.id, self.tenant_id)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "Roles | None":
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("id = $1")
				.where("tenant_id = $2")
			.getQuery()
		)

		row = await temp.fetch_one(sql, id, get_tenant())

		if row is None:
			return None

		return cls.from_row(row, connection)

	@classmethod
	async def findByTenant(cls, connection=None) -> list["Roles"]:
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
	async def getRolesPagination(cls, cursor: str | None = None, connection=None) -> CursorPage:
		temp = cls(connection=connection)
		page_lines = 25

		last_id = 0
		if cursor:
			try:
				payload = decode_cursor(cursor)
				last_id = int(payload.get("id", 0))
			except Exception:
				raise AppException(400, "Invalid cursor")

		sql = (
			SQL()
				.select(cls.table_name)
				.columns("id", "name", "description")
				.where("tenant_id = $1")
				.where("id > $2")
				.order_by("id")
				.limit("$3")
				.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), last_id, page_lines + 1)

		has_more = len(rows) > page_lines
		rows = rows[:page_lines]

		items = [cls.from_row(r, connection) for r in rows]

		next_cursor = None
		if has_more:
			next_cursor = encode_cursor({"id": dict(rows[-1])["id"]})

		return CursorPage(items=items, next_cursor=next_cursor, has_more=has_more)

	@classmethod
	async def findByName(cls, name: str, connection=None) -> "Roles | None":
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("name = $2")
			.getQuery()
		)

		row = await temp.fetch_one(sql, get_tenant(), name)

		if row is None:
			return None

		return cls.from_row(row, connection)
