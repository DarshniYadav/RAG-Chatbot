from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest
from app.services.chat_service import get_or_create_conversation, get_chat_history, save_chat_message, rag_service
from app.utils.dependencies import get_current_user
from app.models.user import User
import json

router = APIRouter(prefix="/chat", tags=["Chat"])

FALLBACK_ASSISTANT_MESSAGE = (
    "I’m unable to generate an AI response right now because the LLM service is unavailable "
    "(API key/quota or connectivity issue). Please try again in a few minutes."
)


def _fallback_reason(exc: Exception) -> str:
    message = str(exc).lower()
    if "insufficient_quota" in message or "quota" in message:
        return "insufficient_quota"
    if "invalid api key" in message or "incorrect api key" in message or "authentication" in message:
        return "invalid_api_key"
    if "timeout" in message or "connection" in message or "network" in message:
        return "network_error"
    return "provider_error"

@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    conversation = await get_or_create_conversation(current_user, payload.conversation_id)
    history = await get_chat_history(conversation)

    # Save user message
    await save_chat_message(conversation, "user", payload.message)

    accept_header = request.headers.get("accept", "").lower()

    if "text/event-stream" not in accept_header:
        full_response = ""
        fallback_reason = None
        try:
            async for token in rag_service.astream_response(
                payload.message,
                history,
                source_file=payload.source_file,
                candidate_name=payload.candidate_name,
                user_id=str(current_user.id),
            ):
                full_response += token
        except Exception as exc:
            full_response = FALLBACK_ASSISTANT_MESSAGE
            fallback_reason = _fallback_reason(exc)

        await save_chat_message(conversation, "assistant", full_response)
        return {
            "conversation_id": str(conversation.id),
            "message": full_response,
            "fallback": full_response == FALLBACK_ASSISTANT_MESSAGE,
            "fallback_reason": fallback_reason,
        }

    async def generate():
        full_response = ""
        fallback_reason = None
        try:
            async for token in rag_service.astream_response(
                payload.message,
                history,
                source_file=payload.source_file,
                candidate_name=payload.candidate_name,
                user_id=str(current_user.id),
            ):
                full_response += token
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as exc:
            full_response = FALLBACK_ASSISTANT_MESSAGE
            fallback_reason = _fallback_reason(exc)
            yield f"data: {json.dumps({'token': full_response, 'fallback': True, 'fallback_reason': fallback_reason})}\n\n"

        # Save assistant message after streaming completes
    await save_chat_message(conversation, "assistant", full_response)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )