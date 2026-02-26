from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field


# Auth schemas
class UserRegister(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str = Field(min_length=6)
    role: Optional[Literal["citizen", "admin", "superadmin"]] = "citizen"
    departments: Optional[List[str]] = []


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    password: str
    role: Literal["citizen", "admin", "superadmin"]
    department: Optional[str] = None


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """JWT token payload data."""
    sub: str  # user_id
    role: str
    department_ids: List[str]


# Grievance schemas
class GrievanceCreate(BaseModel):
    """Citizen grievance submission."""
    message: str = Field(min_length=10, max_length=2000)


class GrievanceClassification(BaseModel):
    """Classification result from ML service."""
    department: Literal["water", "sanitation", "roads", "electricity", "health", "police", "housing", "general", "miscellaneous"]
    priority: Literal["high", "medium", "low"]
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: str


class GrievanceResponse(BaseModel):
    """Grievance response to client."""
    id: str
    user_id: str
    message: str
    predicted_department: str
    priority: str
    confidence: float
    explanation: str
    status: Literal["submitted", "in_progress", "resolved", "rejected"]
    created_at: datetime
    updated_at: datetime


class GrievanceStatusUpdate(BaseModel):
    """Admin status update request."""
    status: Literal["in_progress", "resolved", "rejected"]


# User schema
class User(BaseModel):
    """User model."""
    id: str
    email: EmailStr
    role: str
    departments: List[str]
