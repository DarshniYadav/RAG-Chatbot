from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    source_file: Optional[str] = None
    candidate_name: Optional[str] = None

class ChatResponse(BaseModel):
    conversation_id: str
    message: str