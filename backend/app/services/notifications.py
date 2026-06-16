from app.tables import Notifications, Users, UserRoleAssignments
from app.classes.apiresponse import APIResponse
from app.services.ctx import get_user


async def _get_current_user():

	session = get_user()

	user = await Users.findByEmail(session.email)

	if not user:
		APIResponse.not_found("User not found")
		
	return user


async def create_notification(user_id: int, type: str, message: str, document_type: str = None, record_id: int = None):

	await Notifications.create(
		user_id=user_id,
		type=type,
		message=message,
		document_type=document_type,
		record_id=record_id,
	)


async def notify_node_approvers(node, document_type: str, record_id: int, message: str):
	"""Send a notification to all approvers responsible for a given workflow node."""

	if not node:
		return
	
	if node.approver_type == "user":
		await create_notification(node.approver_id, "workflow_action_required", message, document_type, record_id)

	elif node.approver_type == "role":

		assignments = await UserRoleAssignments.findByRole(node.approver_id)

		for a in assignments:
			await create_notification(a.user_id, "workflow_action_required", message, document_type, record_id)


async def get_unread():

	user = await _get_current_user()

	items = await Notifications.find_unread(user.id)

	return APIResponse.ok("Notifications fetched", [
		{
			"id": n.id,
			"type": n.type,
			"message": n.message,
			"document_type": n.document_type,
			"record_id": n.record_id,
			"is_read": n.is_read,
			"created_at": n.created_at.isoformat() if n.created_at else None,
		}
		for n in items
	])


async def mark_read(notification_id: int):
	user = await _get_current_user()

	await Notifications.mark_read(notification_id, user.id)

	return APIResponse.ok("Marked as read")


async def mark_all_read():

	user = await _get_current_user()

	await Notifications.mark_all_read(user.id)

	return APIResponse.ok("All marked as read")