import certifi

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.core.config import settings

client: AsyncIOMotorClient = None

async def init_db():
    global client
    client = AsyncIOMotorClient(settings.mongo_uri, tlsCAFile=certifi.where())
    await init_beanie(
        database=client.get_default_database(),
        document_models=[User, Conversation, Message]
    )

    
    