from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class NumberingSchemes(Common):

	id: Optional[int] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	document_type: Optional[str] = None
	prefix: Optional[str] = None
	separator: Optional[str] = None
	padding: Optional[int] = None
	include_year: Optional[bool] = None
	include_month: Optional[bool] = None
	next_value: Optional[int] = None
	is_active: Optional[bool] = None
	created_at: Optional[str] = None

	table_name = "numbering_schemes"

	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		document_type: Optional[str] = None,
		prefix: Optional[str] = None,
		separator: Optional[str] = None,
		padding: Optional[int] = None,
		include_year: Optional[bool] = None,
		include_month: Optional[bool] = None,
		next_value: Optional[int] = None,
		is_active: Optional[bool] = None,
		created_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.document_type = document_type
		self.prefix = prefix
		self.separator = separator
		self.padding = padding
		self.include_year = include_year
		self.include_month = include_month
		self.next_value = next_value
		self.is_active = is_active
		self.created_at = created_at

	async def insert(self) -> "NumberingSchemes":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("document_type, prefix, separator, padding, include_year, include_month, next_value")
					.values("$1, $2, $3, $4, $5, $6, $7")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(
			sql,
			self.document_type,
			self.prefix or "",
			self.separator if self.separator is not None else "-",
			self.padding or 4,
			self.include_year or False,
			self.include_month or False,
			self.next_value or 1,
		)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.id = row["id"]
		self.tenant_id = row["tenant_id"]
		self.company_id = row["company_id"]
		self.is_active = row["is_active"]
		self.created_at = row["created_at"]

		return self

	async def update(self) -> "NumberingSchemes":

		if self.id is None:
			raise ValueError("NumberingScheme must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("prefix = $2, separator = $3, padding = $4, include_year = $5, include_month = $6, next_value = $7, is_active = $8")
					.where("id = $1")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(
			sql,
			self.id,
			self.prefix,
			self.separator,
			self.padding,
			self.include_year,
			self.include_month,
			self.next_value,
			self.is_active,
		)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "NumberingSchemes | None":
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
	async def findByCompany(cls, connection=None) -> list["NumberingSchemes"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.scoped()
					.order_by("document_type")
				.getQuery()
		)

		rows = await temp.fetch_all(sql)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def findByDocumentType(cls, document_type: str, connection=None) -> "NumberingSchemes | None":
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.where("document_type = $1")
					.where("is_active = TRUE")
					.scoped()
				.getQuery()
		)

		row = await temp.fetch_one(sql, document_type)

		if row is None:
			return None

		return cls.from_row(row, connection)