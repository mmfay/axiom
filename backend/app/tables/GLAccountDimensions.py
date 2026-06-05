from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.ctx import get_tenant, get_company


@dataclass
class GLAccountDimensions(Common):

	account_id: Optional[int] = None
	dimension_id: Optional[int] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	is_required: Optional[bool] = None

	table_name = "gl_account_dimensions"

	def __init__(
		self,
		account_id: Optional[int] = None,
		dimension_id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		is_required: Optional[bool] = None,
		connection=None,
	):
		super().__init__(connection)
		self.account_id = account_id
		self.dimension_id = dimension_id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.is_required = is_required

	async def insert(self) -> "GLAccountDimensions":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("tenant_id, company_id, account_id, dimension_id, is_required")
					.values("$1, $2, $3, $4, $5")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			get_tenant(),
			get_company(),
			self.account_id,
			self.dimension_id,
			self.is_required if self.is_required is not None else False,
		)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.tenant_id = row["tenant_id"]
		self.company_id = row["company_id"]
		self.is_required = row["is_required"]

		return self

	async def update(self) -> "GLAccountDimensions":

		if self.account_id is None or self.dimension_id is None:
			raise ValueError("GLAccountDimension must have account_id and dimension_id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("is_required = $5")
					.where("tenant_id = $1")
					.where("company_id = $2")
					.where("account_id = $3")
					.where("dimension_id = $4")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			get_tenant(),
			get_company(),
			self.account_id,
			self.dimension_id,
			self.is_required,
		)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	async def delete(self) -> None:

		if self.account_id is None or self.dimension_id is None:
			raise ValueError("GLAccountDimension must have account_id and dimension_id to delete")

		sql = (
			SQL()
				.delete(self.table_name)
					.where("tenant_id = $1")
					.where("company_id = $2")
					.where("account_id = $3")
					.where("dimension_id = $4")
				.getQuery()
		)

		await self.execute(sql, get_tenant(), get_company(), self.account_id, self.dimension_id)

	@classmethod
	async def findByAccount(cls, account_id: int, connection=None) -> list["GLAccountDimensions"]:
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

	@classmethod
	async def findByDimension(cls, dimension_id: int, connection=None) -> list["GLAccountDimensions"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where("dimension_id = $3")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), get_company(), dimension_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def find(cls, account_id: int, dimension_id: int, connection=None) -> "GLAccountDimensions | None":
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where("account_id = $3")
				.where("dimension_id = $4")
			.getQuery()
		)

		row = await temp.fetch_one(sql, get_tenant(), get_company(), account_id, dimension_id)

		if row is None:
			return None

		return cls.from_row(row, connection)