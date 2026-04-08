from app.models.user import User
from app.utils.security import verify_password, get_password_hash, create_access_token
from fastapi import HTTPException

async def register_user(email: str, password: str):
    if await User.find_one(User.email == email):
        raise HTTPException(400, "Email already registered")
    user = User(email=email, hashed_password=get_password_hash(password))
    await user.insert()
    return user

async def authenticate_user(email: str, password: str):
    user = await User.find_one(User.email == email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(400, "Incorrect email or password")
    return user