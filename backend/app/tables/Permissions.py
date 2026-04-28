from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class Permissions(Common):

	# table fields
	id: Optional[int] = None
	name: Optional[str] = None
	description: Optional[str] = None
	created_at: Optional[str] = None

	# table name
	table_name = "permissions"

	def __init__(
		self,
		id: Optional[int] = None,
		name: Optional[str] = None,
		description: Optional[str] = None,
		created_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.name = name
		self.description = description
		self.created_at = created_at

	async def insert(self) -> "Permissions":
		"""
		Inserts a record into permissions table using self properties
		"""
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("name, description")
					.values("$1, $2")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(sql, self.name, self.description)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.id = row["id"]
		self.created_at = row["created_at"]

		return self

	async def update(self) -> "Permissions":
		"""
		Updates a record in the permissions table using self properties
		"""
		if self.id is None:
			raise ValueError("Permission must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("name = $1, description = $2")
					.where("id = $3")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(sql, self.name, self.description, self.id)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "Permissions | None":
		"""
		Finds a record in permissions table by id
		"""
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
	async def findByName(cls, name: str, connection=None) -> "Permissions | None":
		"""
		Finds a record in permissions table by name
		"""
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("name = $1")
			.getQuery()
		)

		row = await temp.fetch_one(sql, name)

		if row is None:
			return None

		return cls.from_row(row, connection)

	@classmethod
	async def findAll(cls, connection=None) -> list["Permissions"]:
		"""
		Returns all permissions
		"""
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
			.getQuery()
		)

		rows = await temp.fetch_all(sql)

		return [cls.from_row(row, connection) for row in rows]
