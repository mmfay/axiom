from pydantic import BaseModel
from typing import Optional


class WorkflowNodeSave(BaseModel):
	id: str
	node_type: str
	label: str
	approver_type: Optional[str] = None
	approver_id: Optional[int] = None
	position_x: float = 0
	position_y: float = 0


class WorkflowEdgeSave(BaseModel):
	id: str
	source: str
	target: str


class SaveGraphRequest(BaseModel):
	nodes: list[WorkflowNodeSave]
	edges: list[WorkflowEdgeSave]


class ToggleWorkflowRequest(BaseModel):
	is_active: bool