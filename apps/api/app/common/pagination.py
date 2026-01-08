from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)
    total: int = Field(0, ge=0)
