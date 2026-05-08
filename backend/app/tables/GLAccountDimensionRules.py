from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.ctx import get_tenant, get_company


@dataclass
class GLAccountDimensionRules(Common):

	id: Optional[int] = None
	account_id: Optional[int] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	dimension_id: Optional[int] = None
	is_required: Optional[bool] = None
	parent_value_id: Optional[int] = None

	table_name = "gl_account_dimension_rules"

	def __init__(
		self,
		id: Optional[int] = None,
		account_id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		dimension_id: Optional[int] = None,
		is_required: Optional[bool] = None,
		parent_value_id: Optional[int] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.account_id = account_id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.dimension_id = dimension_id
		self.is_required = is_required
		self.parent_value_id = parent_value_id

	async def insert(self) -> "GLAccountDimensionRules":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("tenant_id, company_id, account_id, dimension_id, is_required, parent_value_id")
					.values("$1, $2, $3, $4, $5, $6")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(
			sql,
			get_tenant(),
			get_company(),
			self.account_id,
			self.dimension_id,
			self.is_required if self.is_required is not None else False,
			self.parent_value_id,
		)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.id = row["id"]
		self.tenant_id = row["tenant_id"]
		self.company_id = row["company_id"]
		self.is_required = row["is_required"]

		return self

	async def update(self) -> "GLAccountDimensionRules":

		if self.id is None:
			raise ValueError("GLAccountDimensionRule must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("is_required = $4")
					.where("tenant_id = $1")
					.where("compay_id = $2")
					.where("id = $3")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(sql, get_tenant(), get_company(), self.id, self.is_required)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	async def delete(self) -> None:

		if self.id is None:
			raise ValueError("GLAccountDimensionRule must have an id to delete")

		sql = (
			SQL()
				.delete(self.table_name)
					.where("tenant_id = $1")
					.where("company_id = $2")
					.where("id = $3")
				.getQuery()
		)

		await self.execute(sql, get_tenant(), get_company(), self.id)

	@classmethod
	async def find(cls, id: int, connection=None) -> "GLAccountDimensionRules | None":
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
	async def findByAccount(cls, account_id: int, connection=None) -> list["GLAccountDimensionRules"]:
		"""Returns all rules for an account — used to load the full rule set for validation."""
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where("account_id = $3")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), get_company(), account_id)

		return [cls.from_row(row, connection) for row in rows]
