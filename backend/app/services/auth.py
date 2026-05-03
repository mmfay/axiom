from passlib.context import CryptContext
from app.types.auth import LoginRequest, SignupRequest, UserEmail, ResetPassword, Token
from app.tables import Users, Tenants, Entities, Tokens, Roles, UserRoleAssignments, Permissions, RolePermissions
from app.classes import APIResponse
from app.services.mailer import mailer
from app.services.db import db
from app.services import ctx

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

async def login(data: LoginRequest):

	user = await Users.findByEmail(data.email)

	if not user:
		print("user doesnt exist")
		return APIResponse.unauthorized("Invalid credentials")

	if not user.is_enabled:
		print("user not enabled")
		return APIResponse.unauthorized("Account is not enabled")

	if not verify_password(data.password, user.password):
		print("password incorrect")
		return APIResponse.unauthorized("Invalid credentials")

	return user

async def signup(data: SignupRequest):

	user = await Users.findByEmail(data.email)

	if user:
		APIResponse.bad_request("Email already Exists")

	user = await Users.findByUserID(data.user_id)

	if user:
		APIResponse.bad_request("UserID already Exists")

	async with db.transaction() as conn:

		tenant = Tenants(
			name = "your tenant name",
			email = data.email,
			is_active = True,
			connection = conn
		)

		tenant = await tenant.insert()

		if not tenant.id:
			print("Tenant Creation Error")
			APIResponse.internal_error("Error occurred during creation process, please try again.")

		initEntity = Entities(
			name = "your company name",
			tenant_id = tenant.id,
			is_active = True,
			connection = conn
		)

		initEntity = await initEntity.insert()

		if not initEntity.id:
			print("Entity Creation Error")
			APIResponse.internal_error("Error occurred during creation process, please try again.")

		hashed_password = hash_password(data.password)

		# signup user
		user = Users(
			email=data.email,
			user_id=data.user_id,
			password=hashed_password,
			tenant_id=tenant.id,
			default_company_id=initEntity.id,
			connection = conn
		)

		user = await user.insert()

		if not user.id:
			APIResponse.internal_error("Signup Failed, please try again or reach out to support")

		role = Roles(
			tenant_id=tenant.id,
			name="sysadmin",
			description="Full system access",
			connection=conn
		)

		role = await role.insert()

		assignment = UserRoleAssignments(
			user_id=user.id,
			role_id=role.id,
			tenant_id=tenant.id,
			connection=conn
		)

		await assignment.insert()

	await mailer.send_verify_account_email(user)

	return APIResponse.ok("You are now signed up, please review your email for next steps")

def logout():

	return APIResponse.ok("You have logged out successfully")

async def forgotPassword(data: UserEmail):

	user = await Users.findByEmail(data.email)

	if not user:
		print("user not found, but sending ok for security purposes")
		return APIResponse.ok()

	await mailer.send_reset_password_email(user)

	return APIResponse.ok()

async def resetPassword(data: ResetPassword):

	token = await Tokens.findByToken(data.token)

	if not token:
		print("no token found")
		return APIResponse.bad_request("Token expired or doesn't exist")

	user = await Users.find(token.user_id)

	if not user:
		print("no user found")
		return APIResponse.bad_request("Token may be corrupt, please go through forgot password steps again")

	user.password = hash_password(data.password)

	user = await user.update()

	return APIResponse.ok()

async def verifyAccount(data: Token):

	raw_token = data.token

	token = await Tokens.findByToken(raw_token)

	if not token:
		APIResponse.bad_request("Token doesn't exist")

	user = await Users.find(token.user_id)

	if not user:
		APIResponse.bad_request("User doesn't exist")

	user.is_enabled = True

	await user.update()

	return APIResponse.ok("Account Verified")

async def get_me():

	session = ctx.get_user()

	companies = await Entities.findByTenant()

	user = await Users.findByUserID(session.user_id)

	assignments = await UserRoleAssignments.findByUser(user.id)

	roles = []

	for assignment in assignments:
		role = await Roles.find(assignment.role_id)
		if role:
			roles.append({ "id": role.id, "name": role.name })

	active_role = None

	active_role_permissions = []

	if session.active_role_id:
		role = await Roles.find(session.active_role_id)
		if role:
			active_role = { "id": role.id, "name": role.name }
			rp_list = await RolePermissions.findByRole(role.id)
			for rp in rp_list:
				permission = await Permissions.find(rp.permission_id)
				if permission:
					active_role_permissions.append({ "id": permission.id, "name": permission.name })

	return APIResponse.ok("Valid Session", {
		"id": session.id,
		"user_id": session.user_id,
		"email": session.email,
		"tenant_id": session.tenant_id,
		"company_id": session.company_id,
		"default_role_id": user.default_role_id,
		"companies": [{ "id": c.id, "name": c.name } for c in companies],
		"roles": roles,
		"active_role": active_role,
		"active_role_permissions": active_role_permissions,
	})

async def set_company(company_id: int):

	session = ctx.get_user()

	companies = await Entities.findByTenant()

	company_ids = {c.id for c in companies}

	if company_id not in company_ids:
		return APIResponse.bad_request("Company not found in tenant")

	session.company_id = company_id

	await session.update()

	return APIResponse.ok("Active company updated")

async def set_default_role(role_id: int | None):

	session = ctx.get_user()

	user = await Users.findByUserID(session.user_id)

	if not user:
		APIResponse.not_found("User not found")

	if role_id is not None:
		role = await Roles.find(role_id)
		if not role:
			APIResponse.not_found("Role not found")
		assignments = await UserRoleAssignments.findByUser(user.id)
		if not any(a.role_id == role_id for a in assignments):
			APIResponse.bad_request("Role not assigned to user")

	user.default_role_id = role_id

	await user.update()

	return APIResponse.ok("Default role updated")

async def set_role(role_id: int):

	session = ctx.get_user()

	user = await Users.findByUserID(session.user_id)

	assignments = await UserRoleAssignments.findByUser(user.id)

	assigned_role_ids = {a.role_id for a in assignments}
	if role_id not in assigned_role_ids:
		return APIResponse.bad_request("Role not assigned to user")

	session.active_role_id = role_id
	
	await session.update()

	return APIResponse.ok("Active role updated")