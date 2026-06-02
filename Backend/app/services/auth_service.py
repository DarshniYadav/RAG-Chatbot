from app.models.user import User
from app.utils.security import verify_password, get_password_hash, create_access_token
from fastapi import HTTPException
from app.services.local_auth_store import create_local_user, get_local_user

async def register_user(email: str, password: str):
    normalized_email = email.strip().lower()
    hashed_password = get_password_hash(password)

    try:
        if await User.find_one({"email": normalized_email}):
            raise HTTPException(400, "Email already registered")
        user = User(email=normalized_email, hashed_password=hashed_password)
        await user.insert()
        return user
    except HTTPException:
        raise
    except Exception as exc:
        try:
            return create_local_user(normalized_email, hashed_password)
        except ValueError as local_exc:
            raise HTTPException(400, str(local_exc)) from local_exc
        except Exception as local_exc:
            raise Exception(f"Database error during registration: {exc}") from local_exc

async def authenticate_user(email: str, password: str):
    normalized_email = email.strip().lower()

    try:
        user = await User.find_one({"email": normalized_email})
        if user and verify_password(password, user.hashed_password):
            return user
    except Exception as exc:
        user = None

    local_user = get_local_user(normalized_email)
    if local_user and verify_password(password, local_user.hashed_password):
        return local_user

    raise HTTPException(400, "Incorrect email or password")