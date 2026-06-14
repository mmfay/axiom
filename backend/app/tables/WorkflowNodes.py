from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class WorkflowNodes(Common):

	id: Optional[str] = None
	workflow_id: Optional[int] = None
	tenant_id: Optional[int] = None
	node_type: Optional[str] = None
	label: Optional[str] = None
	approver_type: Optional[str] = None
	approver_id: Optional[int] = None
	position_x: float = 0
	position_y: float = 0

	table_name = "workflow_nodes"

	def __init__(self, id=None, workflow_id=None, tenant_id=None, node_type=None, label=None, approver_type=None, approver_id=None, position_x=0, position_y=0, connection=None):
		super().__init__(connection)
		self.id = id
		self.workflow_id = workflow_id
		self.tenant_id = tenant_id
		self.node_type = node_type
		self.label = label
		self.approver_type = approver_type
		self.approver_id = approver_id
		self.position_x = position_x
		self.position_y = position_y

	async def insert(self) -> "WorkflowNodes":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("id, workflow_id, node_type, label, approver_type, approver_id, position_x, position_y")
					.values("$1, $2, $3, $4, $5, $6, $7, $8")
					.scoped(company=False)
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, self.id, self.workflow_id, self.node_type, self.label, self.approver_type, self.approver_id, self.position_x, self.position_y)
		
		if row is None:
			raise ValueError("Insert failed")
		
		return WorkflowNodes.from_row(row)

	@classmethod
	async def find_by_workflow(cls, workflow_id: int, connection=None) -> list["WorkflowNodes"]:

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
	async def find_approval_nodes(cls, workflow_id: int, connection=None) -> list["WorkflowNodes"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.scoped(company=False)
					.where("workflow_id = $1")
					.where("node_type = 'approval'")
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