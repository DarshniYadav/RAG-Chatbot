from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.schemas.auth import UserCreate, Token
from app.services.auth_service import register_user, authenticate_user
from app.utils.security import create_access_token
import json

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(data: UserCreate):
    await register_user(data.email, data.password)
    return {"msg": "User created"}


class LoginPayload(BaseModel):
    """Used when client sends JSON instead of form data"""
    email: str
    password: str


@router.post("/login", response_model=Token)
async def login(
    request: Request,
):
    """
    Login with either:
    - form data (username + password) → Swagger Authorize popup, curl -d, Postman form
    - JSON body { "email": "...", "password": "..." } → frontend fetch/axios, etc.
    """
    email = None
    password = None

    content_type = request.headers.get("content-type", "").lower()

    if "application/json" in content_type:
        body = await request.json()
        if isinstance(body, str):
            try:
                body = json.loads(body)
            except json.JSONDecodeError:
                body = {}
        if isinstance(body, dict):
            email = body.get("email")
            password = body.get("password")
    else:
        form_data = await request.form()
        email = form_data.get("email") or form_data.get("username")
        password = form_data.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Send JSON {email, password} or form fields username/password",
        )

    user = await authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# Optional: keep /token endpoint if some clients specifically call /token
@router.post("/token", response_model=Token)
async def token_login(form: OAuth2PasswordRequestForm = Depends()):
    """Classic OAuth2 token endpoint (form only)"""
    user = await authenticate_user(form.username, form.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}