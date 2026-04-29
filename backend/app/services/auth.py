from passlib.context import CryptContext
from app.types.auth import LoginRequest, SignupRequest, UserEmail, ResetPassword, Token
from app.tables import Users, Tenants, Entities, Tokens, Roles, UserRoleAssignments
from app.classes import APIResponse
from app.services.mailer import mailer
from app.services.db import db

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

async def get_me(current_user):

	companies = await Entities.findByTenant(current_user.tenant_id)

	user = await Users.findByUserID(current_user.user_id)
	assignments = await UserRoleAssignments.findByUser(user.id, current_user.tenant_id)

	roles = []
	
	for assignment in assignments:
		role = await Roles.find(assignment.role_id)
		if role:
			roles.append({ "id": role.id, "name": role.name })

	return APIResponse.ok("Valid Session", {
		"id": current_user.id,
		"user_id": current_user.user_id,
		"email": current_user.email,
		"tenant_id": current_user.tenant_id,
		"company_id": current_user.company_id,
		"companies": [{ "id": c.id, "name": c.name } for c in companies],
		"roles": roles,
	})