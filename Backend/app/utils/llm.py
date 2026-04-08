from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.core.config import settings

def get_llm():
    return ChatGoogleGenerativeAI(
        model="models/gemini-flash-lite-latest",
        temperature=0.7,
        streaming=True,
        google_api_key=settings.gemini_api_key,
        convert_system_message_to_human=True,
    )

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=settings.gemini_api_key,
    )