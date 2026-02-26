from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.schemas import UserRegister, UserLogin, Token, TokenData
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token
)
from app.core.database import get_users_collection

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
optional_security = HTTPBearer(auto_error=False)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
) -> Token:
    """
    Register a new user.
    
    - Citizens can self-register with role='citizen'
    - Only superadmin can create admin or superadmin users
    """
    users_col = get_users_collection()
    
    # Check if email already exists
    existing = await users_col.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Role validation: only superadmin can create admin/superadmin users
    if user_data.role in ["admin", "superadmin"]:
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to create admin users"
            )
        current_user = decode_token(credentials.credentials)
        if current_user.role != "superadmin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only superadmin can create admin or superadmin users"
            )
    
    # Create user document
    user_doc = {
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "role": user_data.role,
        "departments": user_data.departments if user_data.role == "admin" else []
    }
    
    result = await users_col.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create JWT token
    access_token = create_access_token(
        data={
            "sub": user_id,
            "role": user_data.role,
            "department_ids": user_doc["departments"]
        }
    )
    
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin) -> Token:
    """
    Login to get JWT access token.
    
    Token includes: sub (user_id), role, department_ids
    """
    users_col = get_users_collection()
    
    # Find user by email
    user = await users_col.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create JWT token
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "role": user["role"],
            "department_ids": user.get("departments", [])
        }
    )
    
    return Token(access_token=access_token)
