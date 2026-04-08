from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.services.rag_service import RAGService

rag_service = RAGService()

async def get_or_create_conversation(user: User, conversation_id: str | None):
    if conversation_id:
        try:
            from bson.objectid import ObjectId
            # Convert string ID back to ObjectId for MongoDB
            conv_obj_id = ObjectId(conversation_id)
            conv = await Conversation.get(conv_obj_id)
            if conv and str(conv.user.id) == str(user.id):
                return conv
        except Exception as e:
            # If ID is invalid or conversation not found, create new
            pass
    conv = Conversation(user=user)
    await conv.insert()
    return conv

async def get_chat_history(conversation: Conversation):
    try:
        messages = await Message.find(Message.conversation.id == conversation.id).sort("created_at").to_list()
        return [(m.role, m.content) for m in messages]
    except Exception as e:
        # Return empty history if query fails
        return []