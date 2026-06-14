from app.tables import WorkflowDefinitions, WorkflowNodes, Users, GLJournals
from app.classes.apiresponse import APIResponse
from app.services.ctx import get_user

_REGISTRY = {
	"gl_journal": GLJournals,
}


class WorkflowHandler:

	def __init__(self, document_type: str, document_id: int):
		self.document_type = document_type
		self.document_id = document_id
		self._table_cls = _REGISTRY.get(document_type)

		if not self._table_cls:
			APIResponse.not_found("Workflow type not found")

		self._defn = None

	async def check_workflow(self):

		defn = await WorkflowDefinitions.find_by_type(self.document_type)

		if not defn or not defn.is_active:
			APIResponse.bad_request("No active workflow for this document type")

		self._defn = defn

	async def _is_approver(self) -> bool:

		session = get_user()

		nodes = await WorkflowNodes.find_approval_nodes(self._defn.id)

		if not nodes:
			return False
		
		if any(n.approver_type == "role" and n.approver_id == session.active_role_id for n in nodes):
			return True
		
		user_nodes = [n for n in nodes if n.approver_type == "user"]

		if user_nodes:

			user = await Users.findByEmail(session.email)

			if user and any(n.approver_id == user.id for n in user_nodes):
				return True
			
		return False

	async def update_workflow_status(self, status: str):

		if status in ("approved", "rejected"):

			if not await self._is_approver():
				APIResponse.forbidden("You are not an approver for this workflow")

		ok = await self._table_cls.update_workflow_status(self.document_id, status)

		if not ok:
			APIResponse.not_found("Record not found")