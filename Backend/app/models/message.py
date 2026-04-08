from beanie import Document, Link
from datetime import datetime
from app.models.conversation import Conversation

class Message(Document):
    conversation: Link[Conversation]
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "messages"