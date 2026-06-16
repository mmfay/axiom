from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class GLDimensionValues(Common):

	id: Optional[int] = None
	dimension_id: Optional[int] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	code: Optional[str] = None
	name: Optional[str] = None
	is_active: Optional[bool] = None
	created_at: Optional[str] = None

	table_name = "gl_dimension_values"

	def __init__(
		self,
		id: Optional[int] = None,
		dimension_id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		code: Optional[str] = None,
		name: Optional[str] = None,
		is_active: Optional[bool] = None,
		created_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.dimension_id = dimension_id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.code = code
		self.name = name
		self.is_active = is_active
		self.created_at = created_at

	async def insert(self) -> "GLDimensionValues":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("dimension_id, code, name")
					.values("$1, $2, $3")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			self.dimension_id,
			self.code,
			self.name,
		)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.id = row["id"]
		self.tenant_id = row["tenant_id"]
		self.company_id = row["company_id"]
		self.is_active = row["is_active"]
		self.created_at = row["created_at"]

		return self

	async def update(self) -> "GLDimensionValues":

		if self.id is None:
			raise ValueError("GLDimensionValue must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("code = $2, name = $3, is_active = $4")
					.where("id = $1")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			self.id,
			self.code,
			self.name,
			self.is_active,
		)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "GLDimensionValues | None":
		
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

	@classmethod
	async def findByDimension(cls, dimension_id: int, connection=None) -> list["GLDimensionValues"]:

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.where("dimension_id = $1")
					.scoped()
					.order_by("code")
				.getQuery()
		)

		rows = await temp.fetch_all(sql, dimension_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def findByCode(cls, dimension_id: int, code: str, connection=None) -> "GLDimensionValues | None":

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.where("dimension_id = $1")
					.where("code = $2")
					.scoped()
				.getQuery()
		)

		row = await temp.fetch_one(sql, dimension_id, code)

		if row is None:
			return None

		return cls.from_row(row, connection)