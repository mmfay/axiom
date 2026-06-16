from app.tables import WorkflowDefinitions, WorkflowNodes, WorkflowEdges, WorkflowApprovals, Users, GLJournals
from app.classes.apiresponse import APIResponse
from app.services.ctx import get_user

_REGISTRY = {
	"gl_journal": GLJournals,
}


def _ordered_approval_nodes(nodes, edges):
	# Build adjacency map: source_node_id → [target_node_id, ...]
	adj = {}
	for e in edges:
		adj.setdefault(e.source_node_id, []).append(e.target_node_id)

	# Index nodes by id for O(1) lookup during traversal
	node_map = {n.id: n for n in nodes}

	# Traversal must begin at the start node
	start = next((n for n in nodes if n.node_type == "start"), None)
	if not start:
		return []

	# BFS from start — visits nodes in the order they appear in the graph.
	# Only approval nodes are collected; start/end nodes are skipped.
	# visited guards against cycles in malformed graphs.
	result = []
	visited = set()
	queue = [start.id]
	while queue:
		node_id = queue.pop(0)
		if node_id in visited:
			continue
		visited.add(node_id)
		node = node_map.get(node_id)
		if node and node.node_type == "approval":
			result.append(node)
		for next_id in adj.get(node_id, []):
			queue.append(next_id)

	return result


class WorkflowHandler:
	"""
	Encapsulates all workflow execution logic for a single document instance.

	Usage pattern — always call check_workflow() before update_workflow_status():
	    handler = WorkflowHandler(document_type, record_id)
	    await handler.check_workflow()
	    await handler.update_workflow_status("pending" | "approved" | "rejected")

	Adding a new document type: add an entry to _REGISTRY mapping the document_type
	string to the table class, which must implement update_workflow_status(record_id, status).
	"""

	def __init__(self, document_type: str, document_id: int):
		"""
		Resolve the table class for the given document type.
		Raises 404 immediately if the type is not registered.
		_defn and _approval_nodes are populated later by check_workflow().
		"""
		self.document_type = document_type
		self.document_id = document_id
		self._table_cls = _REGISTRY.get(document_type)

		if not self._table_cls:
			APIResponse.not_found("Workflow class not found")

		self._defn = None
		self._approval_nodes = []

	async def check_workflow(self):
		"""
		Load and validate the workflow definition, then build the ordered list
		of approval nodes via graph traversal.

		Must be called before update_workflow_status(). Raises 400 if no active
		workflow definition exists for the document type.
		"""
		defn = await WorkflowDefinitions.find_by_type(self.document_type)

		if not defn or not defn.is_active:
			APIResponse.bad_request("No active workflow for this document type")

		self._defn = defn

		nodes = await WorkflowNodes.find_by_workflow(defn.id)
		edges = await WorkflowEdges.find_by_workflow(defn.id)

		self._approval_nodes = _ordered_approval_nodes(nodes, edges)

	async def _get_current_node(self):
		"""
		Return the first approval node in graph order that has not yet been
		approved for this record. Returns None when all nodes are complete.
		"""
		approved_ids = await WorkflowApprovals.get_approved_node_ids(self.document_type, self.document_id)

		for node in self._approval_nodes:
			if node.id not in approved_ids:
				return node

		return None

	def _is_approver_for_node(self, node, session, user) -> bool:
		"""
		Check whether the current user is the designated approver for a specific node.
		Role match is checked first (no extra DB call); user match uses the already-fetched user record.
		"""
		if node.approver_type == "role" and node.approver_id == session.active_role_id:
			return True
		if node.approver_type == "user" and user and user.id == node.approver_id:
			return True

		return False

	async def update_workflow_status(self, status: str):
		"""
		Advance the workflow for this record to the given status.

		"pending"  — clears any prior approval records (supports resubmission)
		            and sets the record status to pending.

		"approved" — verifies the current user is the approver for the current
		            stage, records the approval, then checks if all nodes are
		            complete. Sets the record to "approved" only when every
		            approval node has been satisfied; otherwise stays "pending"
		            for the next approver.

		"rejected" — verifies the current user is the approver for the current
		            stage, records the rejection, and immediately sets the record
		            to "rejected".
		"""

		await self.check_workflow()

		if status == "pending":
			await WorkflowApprovals.delete_for_record(self.document_type, self.document_id)
			ok = await self._table_cls.update_workflow_status(self.document_id, "pending")
			if not ok:
				APIResponse.not_found("Record not found")
			return

		current_node = await self._get_current_node()
		if not current_node:
			APIResponse.bad_request("No pending approval stage")

		session = get_user()
		user = await Users.findByEmail(session.email)

		if not self._is_approver_for_node(current_node, session, user):
			APIResponse.forbidden("You are not the approver for the current stage")

		await WorkflowApprovals.create(
			workflow_node_id=current_node.id,
			document_type=self.document_type,
			record_id=self.document_id,
			approved_by=user.id,
			status=status,
		)

		if status == "rejected":
			ok = await self._table_cls.update_workflow_status(self.document_id, "rejected")
			if not ok:
				APIResponse.not_found("Record not found")
			return

		approved_ids = await WorkflowApprovals.get_approved_node_ids(self.document_type, self.document_id)
		all_complete = all(n.id in approved_ids for n in self._approval_nodes)
		final_status = "approved" if all_complete else "pending"

		ok = await self._table_cls.update_workflow_status(self.document_id, final_status)

		if not ok:
			APIResponse.not_found("Record not found")