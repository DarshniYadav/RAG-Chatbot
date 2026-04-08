import os
import shutil
from langchain_community.vectorstores import Chroma
from app.core.config import settings
from app.utils.llm import get_embeddings

_vector_store = None

def get_vector_store():
    global _vector_store
    if _vector_store is None:
        os.makedirs(settings.chroma_persist_dir, exist_ok=True)
        try:
            _vector_store = Chroma(
                persist_directory=settings.chroma_persist_dir,
                embedding_function=get_embeddings(),
                collection_name="rag_documents"
            )
        except KeyError as exc:
            if "_type" not in str(exc):
                raise

            legacy_dir = f"{settings.chroma_persist_dir}_legacy"
            if os.path.exists(settings.chroma_persist_dir) and not os.path.exists(legacy_dir):
                shutil.move(settings.chroma_persist_dir, legacy_dir)
            fallback_dir = settings.chroma_persist_dir
            if os.path.exists(settings.chroma_persist_dir):
                fallback_dir = f"{settings.chroma_persist_dir}_fresh"
            os.makedirs(fallback_dir, exist_ok=True)

            _vector_store = Chroma(
                persist_directory=fallback_dir,
                embedding_function=get_embeddings(),
                collection_name="rag_documents"
            )
    return _vector_store