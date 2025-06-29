# rbac.py
import logging

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from clerk_client import CLERK_ISSUER, CLERK_JWT_KEY
from database import SessionLocal
from models import UserDetails

security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        logging.debug("Decoding JWT token")
        # Decode and validate JWT
        payload = jwt.decode(
            credentials.credentials,
            CLERK_JWT_KEY,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
        )
        logging.debug(f"Token payload: {payload}")
        return payload
    except JWTError as e:
        logging.error(f"JWT verification failed: {e}")
        raise credentials_exception


async def get_current_user(
    token_data: dict = Depends(verify_token), db: Session = Depends(get_db)
) -> UserDetails:
    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: Missing user ID")

    # Fetch the user from the database using ClerkID
    user = db.query(UserDetails).filter(UserDetails.ClerkID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


ADMIN_ROLE_ID = "8aee8011-9826-4761-8e02-e6ec9d8e0d67"
USER_ROLE_ID = "77bb19b1-c955-47b1-beb0-d140db0b1a3d"


def role_required(required_role_id: str):
    def role_checker(user: UserDetails = Depends(get_current_user)):
        if user.RoleID != required_role_id:
            raise HTTPException(
                status_code=403, detail="You do not have access to this resource"
            )
        return user

    return role_checker


def get_current_active_user(current_user: UserDetails = Depends(get_current_user)):
    if current_user.RoleID not in [USER_ROLE_ID, ADMIN_ROLE_ID]:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_active_admin(current_user: UserDetails = Depends(get_current_user)):
    if current_user.RoleID != ADMIN_ROLE_ID:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
