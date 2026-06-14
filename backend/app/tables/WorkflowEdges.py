from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class WorkflowEdges(Common):

	id: Optional[str] = None
	workflow_id: Optional[int] = None
	tenant_id: Optional[int] = None
	source_node_id: Optional[str] = None
	target_node_id: Optional[str] = None

	table_name = "workflow_edges"

	def __init__(self, id=None, workflow_id=None, tenant_id=None, source_node_id=None, target_node_id=None, connection=None):
		super().__init__(connection)
		self.id = id
		self.workflow_id = workflow_id
		self.tenant_id = tenant_id
		self.source_node_id = source_node_id
		self.target_node_id = target_node_id

	async def insert(self) -> "WorkflowEdges":
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("id, workflow_id, source_node_id, target_node_id")
					.values("$1, $2, $3, $4")
					.scoped(company=False)
					.returning()
				.getQuery()
		)
		row = await self.fetch_returning(sql, self.id, self.workflow_id, self.source_node_id, self.target_node_id)
		if row is None:
			raise ValueError("Insert failed")
		return WorkflowEdges.from_row(row)

	@classmethod
	async def find_by_workflow(cls, workflow_id: int, connection=None) -> list["WorkflowEdges"]:
		temp = cls(connection=connection)
		sql = (
			SQL()
				.select(cls.table_name)
				.scoped(company=False)
				.where("workflow_id = $1")
				.getQuery()
		)
		rows = await temp.fetch_all(sql, workflow_id)
		return [cls.from_row(r, connection) for r in rows]

	@classmethod
	async def delete_by_workflow(cls, workflow_id: int, connection=None) -> None:
		temp = cls(connection=connection)
		sql = (
			SQL()
				.delete(cls.table_name)
				.scoped(company=False)
				.where("workflow_id = $1")
				.getQuery()
		)
		await temp.execute(sql, workflow_id)
