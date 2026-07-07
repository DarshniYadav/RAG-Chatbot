import certifi

from urllib.parse import quote, urlsplit, urlunsplit

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.core.config import settings

client: AsyncIOMotorClient = None


def _normalize_mongo_uri(mongo_uri: str) -> str:
    parsed = urlsplit(mongo_uri)
    if not parsed.username and not parsed.password:
        return mongo_uri

    username = quote(parsed.username or "", safe="")
    password = quote(parsed.password or "", safe="") if parsed.password is not None else None

    if password is None:
        netloc = f"{username}@{parsed.hostname or ''}"
    else:
        netloc = f"{username}:{password}@{parsed.hostname or ''}"

    if parsed.port:
        netloc = f"{netloc}:{parsed.port}"

    return urlunsplit((parsed.scheme, netloc, parsed.path, parsed.query, parsed.fragment))

async def init_db():
    global client
    normalized_uri = _normalize_mongo_uri(settings.mongo_uri)
    client = AsyncIOMotorClient(normalized_uri, tlsCAFile=certifi.where())
    database = client[settings.mongo_db_name]
    await init_beanie(
        database=database,
        document_models=[User, Conversation, Message]
    )

    
    