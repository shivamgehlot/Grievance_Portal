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
    Login to get JWT access token with role-based access.
    
    Users select their role and department at login time.
    The system validates if they have permission for that role/department.
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
    
    # Validate role access
    user_role = user.get("role", "citizen")
    selected_role = credentials.role
    
    # Citizens can only login as citizens
    if user_role == "citizen" and selected_role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You do not have {selected_role} access"
        )
    
    # Admins can login as citizen or admin (but not superadmin)
    if user_role == "admin" and selected_role not in ["citizen", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You do not have {selected_role} access"
        )
    
    # Superadmins can login with any role
    # (no validation needed for superadmin)
    
    # Validate department access for admin role
    department_ids = []
    if selected_role == "admin":
        if not credentials.department:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department selection required for admin login"
            )
        
        # Check if user has access to the selected department
        user_departments = user.get("departments", [])
        
        # Superadmins have access to all departments
        if user_role == "superadmin":
            department_ids = [credentials.department]
        elif credentials.department not in user_departments:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have access to department: {credentials.department}"
            )
        else:
            department_ids = [credentials.department]
    elif selected_role == "superadmin":
        # Superadmin gets access to all departments
        department_ids = user.get("departments", [])
    
    # Create JWT token with selected role and department
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "role": selected_role,
            "department_ids": department_ids
        }
    )
    
    return Token(access_token=access_token)

