from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.ctx import get_tenant, get_company


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
					.fields("tenant_id, company_id, dimension_id, code, name")
					.values("$1, $2, $3, $4, $5")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			get_tenant(),
			get_company(),
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
					.set("code = $4, name = $5, is_active = $6")
					.where("tenant_id = $1")
					.where("company_id = $2")
					.where("id = $3")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			get_tenant(),
			get_company(),
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
	async def findByDimension(cls, dimension_id: int, connection=None) -> list["GLDimensionValues"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where("dimension_id = $3")
				.order_by("code")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), get_company(), dimension_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def findByCode(cls, dimension_id: int, code: str, connection=None) -> "GLDimensionValues | None":
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where("dimension_id = $3")
				.where("code = $4")
			.getQuery()
		)

		row = await temp.fetch_one(sql, get_tenant(), get_company(), dimension_id, code)

		if row is None:
			return None

		return cls.from_row(row, connection)