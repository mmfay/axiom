from fastapi.responses import JSONResponse
from typing import Any, Optional

from app.classes.appexception import AppException


class APIResponse:

	@staticmethod
	def _build(
		ok: bool,
		message: str,
		status_code: int,
		data: Optional[Any] = None
	) -> JSONResponse:
		return JSONResponse(
			status_code=status_code,
			content={
				"ok": ok,
				"message": message,
				"data": data,
				"status": status_code,
				"statusText": "OK" if ok else "Error",
			},
		)

	# ✅ success responses
	@staticmethod
	def success(
		message: str = "Success",
		data: Optional[Any] = None,
		status_code: int = 200
	) -> JSONResponse:
		return APIResponse._build(True, message, status_code, data)

	@staticmethod
	def ok(message: str = "Success", data: Optional[Any] = None) -> JSONResponse:
		return APIResponse.success(message, data, 200)

	@staticmethod
	def created(message: str = "Created", data: Optional[Any] = None) -> JSONResponse:
		return APIResponse.success(message, data, 201)

	# ✅ error responses (direct)
	@staticmethod
	def error(
		message: str = "Error",
		status_code: int = 400,
		data: Optional[Any] = None
	) -> JSONResponse:
		return APIResponse._build(False, message, status_code, data)

	# ✅ exception-based errors (preferred)
	@staticmethod
	def bad_request(message: str = "Bad Request", data: Optional[Any] = None):
		raise AppException(400, message, data)

	@staticmethod
	def unauthorized(message: str = "Unauthorized", data: Optional[Any] = None):
		raise AppException(401, message, data)

	@staticmethod
	def forbidden(message: str = "Forbidden", data: Optional[Any] = None):
		raise AppException(403, message, data)

	@staticmethod
	def not_found(message: str = "Not Found", data: Optional[Any] = None):
		raise AppException(404, message, data)

	@staticmethod
	def internal_error(message: str = "Internal Server Error", data: Optional[Any] = None):
		raise AppException(500, message, data)