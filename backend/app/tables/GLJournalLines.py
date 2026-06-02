from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.ctx import get_tenant, get_company


@dataclass
class GLJournalLines(Common):

	id: Optional[int] = None
	journal_id: Optional[int] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	account_id: Optional[int] = None
	description: Optional[str] = None
	debit: Optional[float] = None
	credit: Optional[float] = None
	dim1_value_id: Optional[int] = None
	dim2_value_id: Optional[int] = None
	dim3_value_id: Optional[int] = None
	dim4_value_id: Optional[int] = None
	dim5_value_id: Optional[int] = None

	table_name = "gl_journal_lines"

	def __init__(
		self,
		id: Optional[int] = None,
		journal_id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		account_id: Optional[int] = None,
		description: Optional[str] = None,
		debit: Optional[float] = None,
		credit: Optional[float] = None,
		dim1_value_id: Optional[int] = None,
		dim2_value_id: Optional[int] = None,
		dim3_value_id: Optional[int] = None,
		dim4_value_id: Optional[int] = None,
		dim5_value_id: Optional[int] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.journal_id = journal_id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.account_id = account_id
		self.description = description
		self.debit = debit
		self.credit = credit
		self.dim1_value_id = dim1_value_id
		self.dim2_value_id = dim2_value_id
		self.dim3_value_id = dim3_value_id
		self.dim4_value_id = dim4_value_id
		self.dim5_value_id = dim5_value_id

	async def insert(self) -> "GLJournalLines":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("tenant_id, company_id, journal_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id, dim3_value_id, dim4_value_id, dim5_value_id")
					.values("$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(
			sql,
			get_tenant(),
			get_company(),
			self.journal_id,
			self.account_id,
			self.description,
			self.debit or 0,
			self.credit or 0,
			self.dim1_value_id,
			self.dim2_value_id,
			self.dim3_value_id,
			self.dim4_value_id,
			self.dim5_value_id,
		)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.id = row["id"]
		self.tenant_id = row["tenant_id"]
		self.company_id = row["company_id"]

		return self

	@classmethod
	async def findByJournal(cls, journal_id: int, connection=None) -> list["GLJournalLines"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.where("tenant_id = $1")
					.where("company_id = $2")
					.where("journal_id = $3")
				.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), get_company(), journal_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def deleteByJournal(cls, journal_id: int, connection=None) -> None:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.delete(cls.table_name)
					.where("tenant_id = $1")
					.where("company_id = $2")
					.where("journal_id = $3")
				.getQuery()
		)

		await temp.execute(sql, get_tenant(), get_company(), journal_id)
