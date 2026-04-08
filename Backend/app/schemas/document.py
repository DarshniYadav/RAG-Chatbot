from pydantic import BaseModel

class DocumentUploadResponse(BaseModel):
    status: str = "processing"
    message: str