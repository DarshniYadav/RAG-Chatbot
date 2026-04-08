from app.services.embedding_service import process_document
from pathlib import Path
import logging


logger = logging.getLogger(__name__)

async def background_embedding_task(file_path: str, user_id: str | None = None, original_filename: str | None = None):
    try:
        await process_document(file_path, user_id=user_id, original_filename=original_filename)
    except Exception as exc:
        logger.exception("Document embedding failed for %s: %s", file_path, exc)