from app.tables import Roles, Permissions, RolePermissions
from app.classes.apiresponse import APIResponse
from app.services.ctx import get_tenant

async def list_roles(cursor: str | None = None):
	page = await Roles.getRolesPagination(cursor)

	return APIResponse.ok("Roles fetched", {
		"items": [{"id": r.id, "name": r.name, "description": r.description} for r in page.items],
		"next_cursor": page.next_cursor,
		"has_more": page.has_more,
	})

async def update_role(role_id: int, data):

	role = await Roles.find(role_id)

	if not role or role.tenant_id != get_tenant():
		APIResponse.not_found("Role not found")

	if data.name is not None:
		existing = await Roles.findByName(data.name)
		if existing and existing.id != role_id:
			APIResponse.bad_request("A role with that name already exists")
		role.name = data.name

	if data.description is not None:
		role.description = data.description

	role = await role.update()

	return APIResponse.ok("Role updated", {
		"id": role.id,
		"name": role.name,
		"description": role.description,
	})

async def create_role(data):
	existing = await Roles.findByName(data.name)
	if existing:
		APIResponse.bad_request("A role with that name already exists")

	role = Roles(name=data.name, description=data.description)
	role = await role.insert()

	return APIResponse.created("Role created", {
		"id": role.id,
		"name": role.name,
		"description": role.description,
	})

async def get_role_permissions(role_id: int):
	role = await Roles.find(role_id)
	if not role or role.tenant_id != get_tenant():
		APIResponse.not_found("Role not found")

	all_permissions = await Permissions.findAll()
	assignments = await RolePermissions.findByRole(role_id)
	assigned_ids = {a.permission_id for a in assignments}

	assigned = [{"id": p.id, "name": p.name, "description": p.description} for p in all_permissions if p.id in assigned_ids]
	available = [{"id": p.id, "name": p.name, "description": p.description} for p in all_permissions if p.id not in assigned_ids]

	return APIResponse.ok("Role permissions fetched", {"assigned": assigned, "available": available})

async def add_role_permission(role_id: int, permission_id: int):
	role = await Roles.find(role_id)
	if not role or role.tenant_id != get_tenant():
		APIResponse.not_found("Role not found")

	permission = await Permissions.find(permission_id)
	if not permission:
		APIResponse.not_found("Permission not found")

	existing = await RolePermissions.findByRole(role_id)
	if any(a.permission_id == permission_id for a in existing):
		APIResponse.bad_request("Permission already assigned to role")

	assignment = RolePermissions(role_id=role_id, permission_id=permission_id, tenant_id=get_tenant())
	await assignment.insert()

	return APIResponse.ok("Permission assigned")

async def remove_role_permission(role_id: int, permission_id: int):
	role = await Roles.find(role_id)
	if not role or role.tenant_id != get_tenant():
		APIResponse.not_found("Role not found")

	assignment = RolePermissions(role_id=role_id, permission_id=permission_id, tenant_id=get_tenant())
	await assignment.delete()

	return APIResponse.ok("Permission removed")