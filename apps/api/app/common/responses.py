from typing import Generic, TypeVar, Any
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ResponseMeta(BaseModel):
    # Expand here with pagination etc. later
    pass


class ResponseError(BaseModel):
    code: str
    message: str
    details: Any = None


class APIResponse(BaseModel, Generic[T]):
    data: T | None = None
    meta: ResponseMeta | None = None
    error: ResponseError | None = None

    model_config = ConfigDict(from_attributes=True)
