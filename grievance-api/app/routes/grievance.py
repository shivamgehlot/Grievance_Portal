from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from app.schemas import GrievanceCreate, GrievanceResponse, TokenData
from app.core.security import get_current_user
from app.core.database import get_grievances_collection
from app.services.classification_service import classify_grievance

router = APIRouter(prefix="/api/grievances", tags=["Grievances"])


@router.post("", response_model=GrievanceResponse, status_code=status.HTTP_201_CREATED)
async def create_grievance(
    grievance_data: GrievanceCreate,
    current_user: TokenData = Depends(get_current_user)
) -> GrievanceResponse:
    """
    Submit a new grievance (citizen authentication required).
    
    Automatically classifies the grievance using ML service.
    """
    # Classify the grievance
    classification = await classify_grievance(grievance_data.message)
    
    # Create grievance document
    now = datetime.utcnow()
    grievance_doc = {
        "user_id": current_user.sub,
        "message": grievance_data.message,
        "predicted_department": classification.department,
        "priority": classification.priority,
        "confidence": classification.confidence,
        "explanation": classification.explanation,
        "status": "submitted",
        "created_at": now,
        "updated_at": now
    }
    
    grievances_col = get_grievances_collection()
    result = await grievances_col.insert_one(grievance_doc)
    
    grievance_doc["id"] = str(result.inserted_id)
    return GrievanceResponse(**grievance_doc)


@router.get("/my-grievances", response_model=List[GrievanceResponse])
async def get_my_grievances(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: TokenData = Depends(get_current_user)
) -> List[GrievanceResponse]:
    """
    Get all grievances submitted by the current user (paginated).
    """
    grievances_col = get_grievances_collection()
    
    cursor = grievances_col.find({"user_id": current_user.sub}).skip(skip).limit(limit).sort("created_at", -1)
    grievances = await cursor.to_list(length=limit)
    
    return [
        GrievanceResponse(
            id=str(g["_id"]),
            user_id=g["user_id"],
            message=g["message"],
            predicted_department=g["predicted_department"],
            priority=g["priority"],
            confidence=g["confidence"],
            explanation=g["explanation"],
            status=g["status"],
            created_at=g["created_at"],
            updated_at=g["updated_at"]
        )
        for g in grievances
    ]


@router.get("/{grievance_id}", response_model=GrievanceResponse)
async def get_grievance(
    grievance_id: str,
    current_user: TokenData = Depends(get_current_user)
) -> GrievanceResponse:
    """
    Get a specific grievance by ID.
    
    - Owner can always view their own grievance
    - Admin can view grievances for their departments
    - Superadmin can view all grievances
    """
    grievances_col = get_grievances_collection()
    
    try:
        grievance = await grievances_col.find_one({"_id": ObjectId(grievance_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid grievance ID"
        )
    
    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grievance not found"
        )
    
    # Check access permissions
    is_owner = grievance["user_id"] == current_user.sub
    is_superadmin = current_user.role == "superadmin"
    is_dept_admin = (
        current_user.role == "admin" and 
        grievance["predicted_department"] in current_user.department_ids
    )
    
    if not (is_owner or is_superadmin or is_dept_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this grievance"
        )
    
    return GrievanceResponse(
        id=str(grievance["_id"]),
        user_id=grievance["user_id"],
        message=grievance["message"],
        predicted_department=grievance["predicted_department"],
        priority=grievance["priority"],
        confidence=grievance["confidence"],
        explanation=grievance["explanation"],
        status=grievance["status"],
        created_at=grievance["created_at"],
        updated_at=grievance["updated_at"]
    )
