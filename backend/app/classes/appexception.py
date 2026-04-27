from typing import Any, Optional

class AppException(Exception):
    def __init__(self, status_code: int, message: str, data: Optional[Any] = None):
        self.status_code = status_code
        self.message = message
        self.data = data