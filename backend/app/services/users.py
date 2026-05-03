from app.tables import Users, Roles, UserRoleAssignments
from app.classes.apiresponse import APIResponse
from app.services.auth import hash_password
from app.services import ctx

async def create_user(data):
	user = ctx.get_user()

	existing_email = await Users.findByEmail(data.email)
	if existing_email:
		APIResponse.bad_request("Email already exists")

	existing_user_id = await Users.findByUserID(data.user_id)
	if existing_user_id:
		APIResponse.bad_request("User ID already exists")

	new_user = Users(
		email=data.email,
		user_id=data.user_id,
		password=hash_password(data.password),
		tenant_id=user.tenant_id,
		is_enabled=True,
	)

	new_user = await new_user.insert()

	return APIResponse.created("User created", {
		"id": new_user.id,
		"email": new_user.email,
		"user_id": new_user.user_id,
		"is_enabled": new_user.is_enabled,
	})


async def update_user(rec_id: int, data):
	user = ctx.get_user()

	target = await Users.find(rec_id)

	if not target:
		APIResponse.not_found("User not found")

	if target.tenant_id != user.tenant_id:
		APIResponse.forbidden("User does not belong to your tenant")

	if data.email is not None:
		existing = await Users.findByEmail(data.email)
		if existing and existing.id != rec_id:
			APIResponse.bad_request("Email already in use")
		target.email = data.email

	if data.is_enabled is not None:
		target.is_enabled = data.is_enabled

	target = await target.update()

	return APIResponse.ok("User updated", {
		"id": target.id,
		"email": target.email,
		"user_id": target.user_id,
		"is_enabled": target.is_enabled,
	})

async def get_user_roles(rec_id: int):
	user = ctx.get_user()

	target = await Users.find(rec_id)
	if not target:
		APIResponse.not_found("User not found")
	if target.tenant_id != user.tenant_id:
		APIResponse.forbidden("User does not belong to your tenant")

	all_roles = await Roles.findByTenant(user.tenant_id)
	assignments = await UserRoleAssignments.findByUser(rec_id, user.tenant_id)
	assigned_ids = {a.role_id for a in assignments}

	assigned = [{"id": r.id, "name": r.name, "description": r.description} for r in all_roles if r.id in assigned_ids]
	available = [{"id": r.id, "name": r.name, "description": r.description} for r in all_roles if r.id not in assigned_ids]

	return APIResponse.ok("User roles fetched", {"assigned": assigned, "available": available})


async def add_user_role(rec_id: int, role_id: int):
	user = ctx.get_user()

	target = await Users.find(rec_id)
	if not target:
		APIResponse.not_found("User not found")
	if target.tenant_id != user.tenant_id:
		APIResponse.forbidden("User does not belong to your tenant")

	target_role = await Roles.find(role_id)
	if not target_role or target_role.tenant_id != user.tenant_id:
		APIResponse.not_found("Role not found")

	assignments = await UserRoleAssignments.findByUser(rec_id, user.tenant_id)
	if any(a.role_id == role_id for a in assignments):
		APIResponse.bad_request("Role already assigned to user")

	assignment = UserRoleAssignments(user_id=rec_id, role_id=role_id, tenant_id=user.tenant_id)
	await assignment.insert()

	return APIResponse.ok("Role assigned")


async def remove_user_role(rec_id: int, role_id: int):
	user = ctx.get_user()

	target = await Users.find(rec_id)
	if not target:
		APIResponse.not_found("User not found")
	if target.tenant_id != user.tenant_id:
		APIResponse.forbidden("User does not belong to your tenant")

	assignment = UserRoleAssignments(user_id=rec_id, role_id=role_id)
	await assignment.delete()

	return APIResponse.ok("Role removed")


async def get_users_list_page(cursor: str | None = None):
	user = ctx.get_user()
	page = await Users.getUserPagination(user.tenant_id, cursor)

	return APIResponse.ok("Users fetched", {
		"items": [
			{
				"id": u.id,
				"email": u.email,
				"user_id": u.user_id,
				"is_enabled": u.is_enabled,
			}
			for u in page.items
		],
		"next_cursor": page.next_cursor,
		"has_more": page.has_more,
	})