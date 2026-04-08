from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.mongodb import init_db
from app.routers import auth, chat, documents
import asyncio

app = FastAPI(title="RAG Chatbot Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(auth.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)