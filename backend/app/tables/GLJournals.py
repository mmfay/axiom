from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.cursorpage import CursorPage, decode_cursor, encode_cursor
from app.classes.apiresponse import APIResponse
from app.tables.GLJournalLines import GLJournalLines
from app.tables.SLTrans import SLTrans
from app.tables.GLTrans import GLTrans
from app.tables.WorkflowDefinitions import WorkflowDefinitions
from app.services.numbering import get_next_number
from app.classes.glvalidation import GLValidation
from datetime import date
from app.services.db import db
from decimal import Decimal


@dataclass
class GLJournals(Common):

	id: Optional[int] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	journal_date: Optional[str] = None
	reference: Optional[str] = None
	memo: Optional[str] = None
	status: Optional[str] = None
	workflow_status: Optional[str] = None
	created_at: Optional[str] = None
	posted_at: Optional[str] = None

	table_name = "gl_journals"

	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		journal_date: Optional[str] = None,
		reference: Optional[str] = None,
		memo: Optional[str] = None,
		status: Optional[str] = None,
		workflow_status: Optional[str] = None,
		created_at: Optional[str] = None,
		posted_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.journal_date = journal_date
		self.reference = reference
		self.memo = memo
		self.status = status
		self.workflow_status = workflow_status
		self.created_at = created_at
		self.posted_at = posted_at

	async def insert(self) -> "GLJournals":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("journal_date, reference, memo")
					.values("$1, $2, $3")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			self.journal_date,
			self.reference,
			self.memo,
		)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.id = row["id"]
		self.tenant_id = row["tenant_id"]
		self.company_id = row["company_id"]
		self.status = row["status"]
		self.created_at = row["created_at"]

		return self

	async def update(self) -> "GLJournals":

		if self.id is None:
			raise ValueError("GLJournal must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("journal_date = $2, reference = $3, memo = $4, status = $5, workflow_status = $6")
					.where("id = $1")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(
			sql,
			self.id,
			self.journal_date,
			self.reference,
			self.memo,
			self.status,
			self.workflow_status,
		)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	async def set_posted(self, conn) -> "GLJournals":

		sql = (
			SQL()
				.update(self.table_name)
					.set("status = $2, posted_at = NOW()")
					.where("id = $1")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await conn.fetchrow(sql, self.id, 'posted')

		if row is None:
			raise ValueError("Post Failed: No row returned")

		self.status = row["status"]
		self.posted_at = row["posted_at"]

		return self

	@classmethod
	async def update_workflow_status(cls, record_id: int, status: str, connection=None) -> bool:
		
		temp = cls(connection=connection)

		sql = (
			SQL()
				.update(cls.table_name)
					.set("workflow_status = $2")
					.where("id = $1")
					.scoped()
					.returning()
				.getQuery()
		)

		row = await temp.fetch_returning(sql, record_id, status)
		
		return row is not None

	@classmethod
	async def find(cls, id: int, connection=None) -> "GLJournals | None":
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
	async def getPagination(cls, cursor: str | None = None, journal_date: str | None = None, reference: str | None = None, memo: str | None = None, status: str | None = None, connection=None) -> CursorPage:

		temp = cls(connection=connection)

		page_lines = 2

		last_id = 0
		
		if cursor:
			try:
				payload = decode_cursor(cursor)
				last_id = int(payload.get("id", 0))
			except Exception:
				APIResponse.bad_request("Invalid Cursor")

		params: list = [last_id]

		sql = (
			SQL()
				.select(cls.table_name)
					.columns("id", "journal_date", "reference", "memo", "status", "workflow_status", "company_id", "tenant_id")
					.where("id > $1")
					.scoped()
		)

		if journal_date:
			params.append(date.fromisoformat(journal_date))
			sql.where(f"journal_date = ${len(params)}")

		if reference:
			params.append(f"%{reference}%")
			sql.where(f"reference ILIKE ${len(params)}")

		if memo:
			params.append(f"%{memo}%")
			sql.where(f"memo ILIKE ${len(params)}")

		if status:
			params.append(status)
			sql.where(f"status = ${len(params)}")

		params.append(page_lines + 1)
		sql = sql.order_by("id").limit(f"${len(params)}").getQuery()
		
		rows = await temp.fetch_all(sql, *params)

		has_more = len(rows) > page_lines
		rows = rows[:page_lines]

		items = [cls.from_row(r, connection) for r in rows]

		next_cursor = None
		if has_more:
			next_cursor = encode_cursor({"id": dict(rows[-1])["id"]})

		return CursorPage(items=items, next_cursor=next_cursor, has_more=has_more)

	async def post(self):

		if not self.reference:
			APIResponse.bad_request("Journal does not have a Reference ID")

		if not self.workflow_status == "approved":
			workflow = await WorkflowDefinitions.find_by_type("gl_journal")
			if workflow.is_active:
				APIResponse.bad_request("Journal is not approved.")

		# Validate Journal
			# check sums of credits/debits make sure they balance
			# check that accounts exist
			# check that dimensions are valid for accounts
			# post SL Trans
			# post GL Trans
			# post Journal
			# if 1 of 3 posts fails, then rollback
		async with db.transaction() as conn:

			next_voucher = await get_next_number("voucher", conn)

			lines = await GLJournalLines.findByJournal(self.id)

			# Validation of journal amounts
			total_debit = sum(Decimal(str(l.debit)) for l in lines)
			total_credit = sum(Decimal(str(l.credit)) for l in lines)

			if abs(total_debit - total_credit) >= Decimal("0.01"):
				APIResponse.bad_request(f"Posting Failed: Journal is not balanced: debits {total_debit} ≠ credits {total_credit}")

			if total_debit == 0:
				APIResponse.bad_request("Posting Failed: Journal has no amounts")

			# Validate Journal Accounts & Dimensions
			for l in lines:

				await GLValidation(
					l.account_id, 
					l.dim1_value_id, 
					l.dim2_value_id, 
					l.dim3_value_id,
					l.dim4_value_id,
					l.dim5_value_id
				).validate()
				
			self._connection = conn

			for l in lines: 
				
				sl_transaction = SLTrans(
					connection=conn,
					type='gl_journal',
					reference=self.reference,
					description=l.description,
					amount= l.debit if l.debit else l.credit,
					transaction_date=self.journal_date,
					voucher=next_voucher,
				)

				await sl_transaction.insert()	

			for l in lines:
				gl_trans = GLTrans(
					connection=conn,
					transaction_date=self.journal_date,
					account_id=l.account_id,
					description=l.description,
					debit=l.debit,
					credit=l.credit,
					dim1_value_id=l.dim1_value_id,
					dim2_value_id=l.dim2_value_id,
					dim3_value_id=l.dim3_value_id,
					dim4_value_id=l.dim4_value_id,
					dim5_value_id=l.dim5_value_id,
					voucher=next_voucher,
				)

			await gl_trans.insert()
			
			self.status = 'posted'

			await self.update()