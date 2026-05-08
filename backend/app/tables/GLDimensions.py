from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.ctx import get_tenant, get_company


@dataclass
class GLDimensions(Common):

	id: Optional[int] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	slot: Optional[int] = None
	name: Optional[str] = None
	is_active: Optional[bool] = None
	created_at: Optional[str] = None

	table_name = "gl_dimensions"

	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		slot: Optional[int] = None,
		name: Optional[str] = None,
		is_active: Optional[bool] = None,
		created_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.slot = slot
		self.name = name
		self.is_active = is_active
		self.created_at = created_at

	async def insert(self) -> "GLDimensions":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("tenant_id, company_id, slot, name, is_active")
					.values("$1, $2, $3, $4, $5")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(
			sql,
			get_tenant(),
			get_company(),
			self.slot,
			self.name,
			self.is_active if self.is_active is not None else True,
		)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.id = row["id"]
		self.tenant_id = row["tenant_id"]
		self.company_id = row["company_id"]
		self.is_active = row["is_active"]
		self.created_at = row["created_at"]

		return self

	async def update(self) -> "GLDimensions":

		if self.id is None:
			raise ValueError("GLDimension must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("name = $4, is_active = $5")
					.where("tenant_id = $1")
					.where("company_id = $2")
					.where("id = $3")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(
			sql,
			get_tenant(),
			get_company(),
			self.id,
			self.name,
			self.is_active,
		)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "GLDimensions | None":
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
	async def findByCompany(cls, company_id: int, connection=None) -> list["GLDimensions"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.order_by("slot")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), company_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def findBySlot(cls, slot: int, connection=None) -> "GLDimensions | None":
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where("slot = $3")
			.getQuery()
		)

		row = await temp.fetch_one(sql, get_tenant(), get_company(), slot)

		if row is None:
			return None

		return cls.from_row(row, connection)