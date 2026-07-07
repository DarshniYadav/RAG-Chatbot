from dataclasses import dataclass
from uuid import uuid4

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.services.rag_service import RAGService

rag_service = RAGService()
_LOCAL_CHAT_HISTORY: dict[str, list[tuple[str, str]]] = {}


@dataclass
class LocalConversation:
    id: str
    user: object

async def get_or_create_conversation(user: User, conversation_id: str | None):
    if isinstance(user, User):
        if conversation_id:
            try:
                from bson.objectid import ObjectId

                conv_obj_id = ObjectId(conversation_id)
                conv = await Conversation.get(conv_obj_id)
                if conv and str(conv.user.id) == str(user.id):
                    return conv
            except Exception:
                pass

        try:
            conv = Conversation(user=user)
            await conv.insert()
            return conv
        except Exception:
            pass

    local_conversation_id = conversation_id or uuid4().hex
    _LOCAL_CHAT_HISTORY.setdefault(local_conversation_id, [])
    return LocalConversation(id=local_conversation_id, user=user)

async def get_chat_history(conversation: Conversation):
    conversation_id = str(getattr(conversation, "id", "") or "")
    if conversation_id in _LOCAL_CHAT_HISTORY:
        return list(_LOCAL_CHAT_HISTORY.get(conversation_id, []))

    try:
        messages = await Message.find(Message.conversation.id == conversation.id).sort("created_at").to_list()
        return [(m.role, m.content) for m in messages]
    except Exception:
        return list(_LOCAL_CHAT_HISTORY.get(conversation_id, []))


async def save_chat_message(conversation: Conversation, role: str, content: str):
    conversation_id = str(getattr(conversation, "id", "") or "")

    if isinstance(conversation, Conversation):
        try:
            message = Message(conversation=conversation, role=role, content=content)
            await message.insert()
            return message
        except Exception:
            pass

    if conversation_id:
        _LOCAL_CHAT_HISTORY.setdefault(conversation_id, []).append((role, content))
    return None