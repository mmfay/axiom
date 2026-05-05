from contextvars import ContextVar

_user: ContextVar = ContextVar("_user", default=None)

def set_user(user) -> None:
	_user.set(user)

def get_user():
	user = _user.get()
	if user is None:
		raise RuntimeError("No authenticated user in context")
	return user

def get_tenant() -> int:
	return get_user().tenant_id

def get_company() -> int:
	return get_user().company_id