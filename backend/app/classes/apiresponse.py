from fastapi.responses import JSONResponse
from typing import Any, Optional

from app.classes.appexception import AppException

class APIResponse:

	# Handles success messages back to the client
	@staticmethod
	def success(
		message: str = "Success",
		data: Optional[Any] = None,
		status_code: int = 200
	) -> JSONResponse:
		return JSONResponse(
			status_code=status_code,
			content={
				"success": True,
				"message": message,
				"data": data
			}
		)

	#Handles error messages back to the client
	@staticmethod
	def error(
		message: str = "Error",
		status_code: int = 400,
		data: Optional[Any] = None
	) -> JSONResponse:
		return JSONResponse(
			status_code=status_code,
			content={
				"success": False,
				"message": message,
				"data": data
			}
		)
	
	@staticmethod
	def ok(message: str = "Success", data: Optional[Any] = None) -> JSONResponse:
		return APIResponse.success(message, data, 200)

	@staticmethod
	def created(message: str = "Created", data: Optional[Any] = None) -> JSONResponse:
		return APIResponse.success(message, data, 201)

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