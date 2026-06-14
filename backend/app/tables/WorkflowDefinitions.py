from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class WorkflowDefinitions(Common):

	id: Optional[int] = None
	tenant_id: Optional[int] = None
	document_type: Optional[str] = None
	is_active: bool = False
	created_at: Optional[str] = None

	table_name = "workflow_definitions"

	def __init__(self, id=None, tenant_id=None, document_type=None, is_active=False, created_at=None, connection=None):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.document_type = document_type
		self.is_active = is_active
		self.created_at = created_at

	async def upsert_toggle(self) -> "WorkflowDefinitions":
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("document_type, is_active")
					.values("$1, $2")
					.scoped(company=False)
					.on_conflict("tenant_id, document_type", "DO UPDATE SET is_active = EXCLUDED.is_active")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, self.document_type, self.is_active)

		if row is None:
			raise ValueError("Upsert failed")

		return WorkflowDefinitions.from_row(row)

	async def ensure_exists(self) -> "WorkflowDefinitions":
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("document_type, is_active")
					.values("$1, FALSE")
					.scoped(company=False)
					.on_conflict("tenant_id, document_type")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, self.document_type)

		if row:
			return WorkflowDefinitions.from_row(row)

		return await WorkflowDefinitions.find_by_type(self.document_type, connection=self._connection)

	@classmethod
	async def find_by_type(cls, document_type: str, connection=None) -> "WorkflowDefinitions | None":
		temp = cls(connection=connection)
		sql = (
			SQL()
				.select(cls.table_name)
				.scoped(company=False)
				.where("document_type = $1")
				.getQuery()
		)
		row = await temp.fetch_one(sql, document_type)
		return cls.from_row(row, connection) if row else None

	@classmethod
	async def find_all(cls, connection=None) -> list["WorkflowDefinitions"]:
		temp = cls(connection=connection)
		sql = (
			SQL()
				.select(cls.table_name)
				.scoped(company=False)
				.order_by("document_type")
				.getQuery()
		)
		rows = await temp.fetch_all(sql)
		return [cls.from_row(r, connection) for r in rows]