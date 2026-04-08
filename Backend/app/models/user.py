from beanie import Document, Indexed
from datetime import datetime

class User(Document):
    email: Indexed(str, unique=True)
    hashed_password: str
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"