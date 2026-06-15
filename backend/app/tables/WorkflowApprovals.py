from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class WorkflowApprovals(Common):

	id: Optional[int] = None
	tenant_id: Optional[int] = None
	workflow_node_id: Optional[str] = None
	document_type: Optional[str] = None
	record_id: Optional[int] = None
	approved_by: Optional[int] = None
	status: Optional[str] = None

	table_name = "workflow_approvals"

	def __init__(self, id=None, tenant_id=None, workflow_node_id=None, document_type=None, record_id=None, approved_by=None, status=None, connection=None):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.workflow_node_id = workflow_node_id
		self.document_type = document_type
		self.record_id = record_id
		self.approved_by = approved_by
		self.status = status

	@classmethod
	async def create(cls, workflow_node_id: str, document_type: str, record_id: int, approved_by: int, status: str, connection=None) -> "WorkflowApprovals":
		
		temp = cls(connection=connection)

		sql = (
			SQL()
				.insert(cls.table_name)
					.fields("workflow_node_id, document_type, record_id, approved_by, status")
					.values("$1, $2, $3, $4, $5")
					.scoped(company=False)
					.returning()
				.getQuery()
		)

		row = await temp.fetch_returning(sql, workflow_node_id, document_type, record_id, approved_by, status)

		if row is None:
			raise ValueError("Insert failed")
		
		return cls.from_row(row, connection)

	@classmethod
	async def get_approved_node_ids(cls, document_type: str, record_id: int, connection=None) -> set:

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.columns("workflow_node_id")
					.scoped(company=False)
					.where("document_type = $1")
					.where("record_id = $2")
					.where("status = 'approved'")
				.getQuery()
		)

		rows = await temp.fetch_all(sql, document_type, record_id)

		return {cls.from_row(r).workflow_node_id for r in rows}

	@classmethod
	async def delete_for_record(cls, document_type: str, record_id: int, connection=None) -> None:

		temp = cls(connection=connection)

		sql = (
			SQL()
				.delete(cls.table_name)
					.scoped(company=False)
					.where("document_type = $1")
					.where("record_id = $2")
				.getQuery()
		)

		await temp.execute(sql, document_type, record_id)