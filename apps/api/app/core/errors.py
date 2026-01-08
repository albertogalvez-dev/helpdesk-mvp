from typing import Any

from fastapi import HTTPException, status


class HelpdeskException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        detail: Any = None,
        headers: dict[str, str] | None = None,
    ):
        super().__init__(status_code=status_code, detail=message, headers=headers)
        self.code = code
        self.message = message
        self.details = detail


class NotAuthenticated(HelpdeskException):
    def __init__(self, message: str = "Not authenticated", detail: Any = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="NOT_AUTHENTICATED",
            message=message,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class PermissionDenied(HelpdeskException):
    def __init__(self, message: str = "Permission denied", detail: Any = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            message=message,
            detail=detail,
        )


class NotFound(HelpdeskException):
    def __init__(self, message: str = "Not found", detail: Any = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=message,
            detail=detail,
        )


class BadRequest(HelpdeskException):
    def __init__(self, message: str = "Bad request", detail: Any = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="BAD_REQUEST",
            message=message,
            detail=detail,
        )
