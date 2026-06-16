from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class Entities(Common):

	# table fields
	id: Optional[int] = None
	tenant_id: Optional[int] = None
	name: Optional[str] = None
	created_at: Optional[str] = None
	is_active: Optional[bool] = None

	# table name
	table_name = "entities"

	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		name: Optional[str] = None,
		created_at: Optional[str] = None,
		is_active: Optional[bool] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.name = name
		self.created_at = created_at
		self.is_active = is_active

	async def insert(self) -> "Entities":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("name")
					.values("$1")
					.scoped(company=False)
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, self.name)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.id = row["id"]
		self.tenant_id = row["tenant_id"]
		self.created_at = row["created_at"]
		self.is_active = row["is_active"]

		return self

	async def update(self) -> "Entities":

		if self.id is None:
			raise ValueError("Entity must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("name = $1, is_active = $2")
					.where("id = $3")
					.scoped(company=False)
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, self.name, self.is_active, self.id)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	@classmethod
	async def findByTenant(cls, connection=None) -> list["Entities"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.where("is_active = TRUE")
					.scoped(company=False)
				.getQuery()
		)

		rows = await temp.fetch_all(sql)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def find(cls, id: int, connection=None) -> "Entities | None":
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