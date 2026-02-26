from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from app.schemas import GrievanceResponse, GrievanceStatusUpdate, TokenData
from app.core.security import get_current_user
from app.core.database import get_grievances_collection

router = APIRouter(prefix="/api/admin", tags=["Admin"])


async def require_admin(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """Dependency to require admin or superadmin role."""
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/grievances", response_model=List[GrievanceResponse])
async def get_grievances(
    dept: Optional[str] = Query(None, description="Filter by department"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=10000),
    current_user: TokenData = Depends(require_admin)
) -> List[GrievanceResponse]:
    """
    Get grievances for admin (filtered by department and status).
    
    - Admin can only see grievances for departments they manage
    - Superadmin can see all grievances
    - Supports pagination (limit increased to 10000 for analytics)
    """
    grievances_col = get_grievances_collection()
    
    # Build query filter
    query = {}
    
    # Department filter
    if dept:
        # Check if admin has access to this department
        if current_user.role == "admin":
            if dept not in current_user.department_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied to department: {dept}"
                )
        query["predicted_department"] = dept
    else:
        # If no dept specified, filter by admin's departments (except superadmin)
        if current_user.role == "admin":
            if current_user.department_ids:
                query["predicted_department"] = {"$in": current_user.department_ids}
            else:
                # Admin with no departments sees nothing
                return []
    
    # Status filter
    if status_filter:
        query["status"] = status_filter
    
    # Execute query
    cursor = grievances_col.find(query).skip(skip).limit(limit).sort("created_at", -1)
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


@router.patch("/grievances/{grievance_id}/status", response_model=GrievanceResponse)
async def update_grievance_status(
    grievance_id: str,
    status_update: GrievanceStatusUpdate,
    current_user: TokenData = Depends(require_admin)
) -> GrievanceResponse:
    """
    Update grievance status (admin only).
    
    - Admin can only update grievances for their departments
    - Superadmin can update any grievance
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
    
    # Check department access for admin
    if current_user.role == "admin":
        if grievance["predicted_department"] not in current_user.department_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this grievance's department"
            )
    
    # Update status
    update_result = await grievances_col.update_one(
        {"_id": ObjectId(grievance_id)},
        {
            "$set": {
                "status": status_update.status,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if update_result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update grievance"
        )
    
    # Fetch updated grievance
    updated_grievance = await grievances_col.find_one({"_id": ObjectId(grievance_id)})
    
    return GrievanceResponse(
        id=str(updated_grievance["_id"]),
        user_id=updated_grievance["user_id"],
        message=updated_grievance["message"],
        predicted_department=updated_grievance["predicted_department"],
        priority=updated_grievance["priority"],
        confidence=updated_grievance["confidence"],
        explanation=updated_grievance["explanation"],
        status=updated_grievance["status"],
        created_at=updated_grievance["created_at"],
        updated_at=updated_grievance["updated_at"]
    )
