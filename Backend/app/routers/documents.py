from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends, HTTPException
from pathlib import Path
from app.tasks.embedding_tasks import background_embedding_task
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.core.config import settings, BASE_DIR
import shutil
from uuid import uuid4

router = APIRouter(prefix="/documents", tags=["Documents"])
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    upload_dir = Path(settings.upload_dir)
    if not upload_dir.is_absolute():
        upload_dir = BASE_DIR / upload_dir

    if upload_dir.exists() and not upload_dir.is_dir():
        upload_dir = BASE_DIR / "uploads_dir"

    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = Path(file.filename or "").name
    if not filename:
        raise HTTPException(status_code=400, detail="Invalid file name")

    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{extension}'. Allowed: {allowed}")

    unique_name = f"{uuid4().hex}_{filename}"
    file_path = upload_dir / unique_name

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    background_tasks.add_task(
        background_embedding_task,
        str(file_path),
        str(current_user.id),
        filename,
    )
    return {
        "status": "processing",
        "filename": filename,
        "source_file": unique_name,
    }