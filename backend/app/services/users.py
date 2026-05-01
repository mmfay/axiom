from app.tables import Users, Roles
from app.classes.apiresponse import APIResponse
from app.services.auth import hash_password
from app.types.auth import CreateUserRequest, UpdateUserRequest

async def create_user(current_user, data: CreateUserRequest):

	role = await Roles.find(current_user.active_role_id) if current_user.active_role_id else None

	if not role or role.name != "sysadmin":
		APIResponse.forbidden("Only sysadmins can create users")

	existing_email = await Users.findByEmail(data.email)
	if existing_email:
		APIResponse.bad_request("Email already exists")

	existing_user_id = await Users.findByUserID(data.user_id)
	if existing_user_id:
		APIResponse.bad_request("User ID already exists")

	user = Users(
		email=data.email,
		user_id=data.user_id,
		password=hash_password(data.password),
		tenant_id=current_user.tenant_id,
		is_enabled=True,
	)

	user = await user.insert()

	return APIResponse.created("User created", {
		"id": user.id,
		"email": user.email,
		"user_id": user.user_id,
		"is_enabled": user.is_enabled,
	})

async def update_user(current_user, rec_id: int, data: UpdateUserRequest):

	role = await Roles.find(current_user.active_role_id) if current_user.active_role_id else None

	user = await Users.find(rec_id)

	if not user:
		APIResponse.not_found("User not found")

	if user.tenant_id != current_user.tenant_id:
		APIResponse.forbidden("User does not belong to your tenant")

	if data.email is not None:
		existing = await Users.findByEmail(data.email)
		if existing and existing.id != rec_id:
			APIResponse.bad_request("Email already in use")
		user.email = data.email

	if data.is_enabled is not None:
		user.is_enabled = data.is_enabled

	user = await user.update()

	return APIResponse.ok("User updated", {
		"id": user.id,
		"email": user.email,
		"user_id": user.user_id,
		"is_enabled": user.is_enabled,
	})

async def get_users_list_page(current_user, cursor: str | None = None):
    page = await Users.getUserPagination(current_user.tenant_id, cursor)

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