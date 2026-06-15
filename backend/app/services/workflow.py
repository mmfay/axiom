from app.tables import WorkflowDefinitions, WorkflowNodes, WorkflowEdges, WorkflowApprovals, Users
from app.classes.workflowhandler import WorkflowHandler, _ordered_approval_nodes
from app.classes.apiresponse import APIResponse
from app.services.db import db

DOCUMENT_TYPES: dict[str, str] = {
	"gl_journal": "General Journal",
}

async def list_workflows():

	definitions = {d.document_type: d for d in await WorkflowDefinitions.find_all()}

	result = []
	
	for doc_type, label in DOCUMENT_TYPES.items():
		defn = definitions.get(doc_type)
		result.append({
			"document_type": doc_type,
			"label": label,
			"is_active": defn.is_active if defn else False,
		})

	return APIResponse.ok("Workflows fetched", result)


async def get_workflow(document_type: str):

	if document_type not in DOCUMENT_TYPES:
		APIResponse.not_found("Workflow type not found")

	defn = await WorkflowDefinitions.find_by_type(document_type)

	nodes = []
	edges = []

	if defn:
		node_rows = await WorkflowNodes.find_by_workflow(defn.id)
		edge_rows = await WorkflowEdges.find_by_workflow(defn.id)
		nodes = [
			{
				"id": n.id,
				"node_type": n.node_type,
				"label": n.label,
				"approver_type": n.approver_type,
				"approver_id": n.approver_id,
				"position_x": float(n.position_x),
				"position_y": float(n.position_y),
			}
			for n in node_rows
		]
		edges = [
			{
				"id": e.id, 
				"source": e.source_node_id, 
				"target": e.target_node_id
			}
			for e in edge_rows
		]

	return APIResponse.ok("Workflow fetched", {
		"document_type": document_type,
		"label": DOCUMENT_TYPES[document_type],
		"is_active": defn.is_active if defn else False,
		"nodes": nodes,
		"edges": edges,
	})


async def toggle_workflow(document_type: str, is_active: bool):

	if document_type not in DOCUMENT_TYPES:
		APIResponse.not_found("Workflow type not found")

	defn = WorkflowDefinitions(document_type=document_type, is_active=is_active)
	defn = await defn.upsert_toggle()

	return APIResponse.ok("Workflow updated", {
		"document_type": document_type,
		"is_active": defn.is_active,
	})


async def save_graph(document_type: str, data):

	if document_type not in DOCUMENT_TYPES:
		APIResponse.not_found("Workflow type not found")

	async with db.transaction() as conn:

		defn_obj = WorkflowDefinitions(document_type=document_type, connection=conn)
		defn = await defn_obj.ensure_exists()

		await WorkflowNodes.delete_by_workflow(defn.id, connection=conn)
		await WorkflowEdges.delete_by_workflow(defn.id, connection=conn)

		for n in data.nodes:
			node = WorkflowNodes(
				connection=conn,
				id=n.id,
				workflow_id=defn.id,
				node_type=n.node_type,
				label=n.label,
				approver_type=n.approver_type,
				approver_id=n.approver_id,
				position_x=n.position_x,
				position_y=n.position_y,
			)
			await node.insert()

		for e in data.edges:
			edge = WorkflowEdges(
				connection=conn,
				id=e.id,
				workflow_id=defn.id,
				source_node_id=e.source,
				target_node_id=e.target,
			)
			await edge.insert()

	return APIResponse.ok("Workflow saved")


async def get_workflow_history(document_type: str, record_id: int):

	if document_type not in DOCUMENT_TYPES:
		APIResponse.not_found("Workflow type not found")

	defn = await WorkflowDefinitions.find_by_type(document_type)
	if not defn:
		return APIResponse.ok("No workflow", {"steps": []})

	nodes = await WorkflowNodes.find_by_workflow(defn.id)
	edges = await WorkflowEdges.find_by_workflow(defn.id)
	ordered = _ordered_approval_nodes(nodes, edges)

	approvals = await WorkflowApprovals.find_for_record(document_type, record_id)
	approval_map = {a.workflow_node_id: a for a in approvals}

	steps = []
	for node in ordered:
		approval = approval_map.get(node.id)
		if approval:
			user = await Users.find(approval.approved_by)
			steps.append({
				"label": node.label,
				"status": approval.status,
				"actioned_by": user.email if user else None,
				"actioned_at": approval.created_at.isoformat() if approval.created_at else None,
			})
		else:
			steps.append({
				"label": node.label,
				"status": "pending",
				"actioned_by": None,
				"actioned_at": None,
			})

	return APIResponse.ok("Workflow history", {"steps": steps})


async def submit_workflow(document_type: str, record_id: int):

	handler = WorkflowHandler(document_type, record_id)

	await handler.check_workflow()
	await handler.update_workflow_status("pending")

	return APIResponse.ok("Submitted for approval")


async def approve_workflow(document_type: str, record_id: int):

	handler = WorkflowHandler(document_type, record_id)

	await handler.check_workflow()
	await handler.update_workflow_status("approved")

	return APIResponse.ok("Approved")


async def reject_workflow(document_type: str, record_id: int):

	handler = WorkflowHandler(document_type, record_id)

	await handler.check_workflow()
	await handler.update_workflow_status("rejected")
	
	return APIResponse.ok("Rejected")