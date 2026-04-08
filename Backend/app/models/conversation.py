from beanie import Document, Link
from datetime import datetime
from app.models.user import User

class Conversation(Document):
    user: Link[User]
    title: str = "New Chat"
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "conversations"