"""
Seed script to initialize departments and optionally create a superadmin user.

Usage:
    python -m scripts.seed_departments
    python -m scripts.seed_departments --create-superadmin email=admin@example.com password=SecurePass123
"""
import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


DEPARTMENTS = [
    {
        "_id": "water",
        "name": "Water Supply",
        "sla_hours": 24,
        "contact_email": "water@municipal.gov"
    },
    {
        "_id": "sanitation",
        "name": "Sanitation & Waste",
        "sla_hours": 48,
        "contact_email": "sanitation@municipal.gov"
    },
    {
        "_id": "roads",
        "name": "Roads & Infrastructure",
        "sla_hours": 72,
        "contact_email": "roads@municipal.gov"
    },
    {
        "_id": "electricity",
        "name": "Electricity",
        "sla_hours": 12,
        "contact_email": "electricity@municipal.gov"
    },
    {
        "_id": "health",
        "name": "Public Health",
        "sla_hours": 24,
        "contact_email": "health@municipal.gov"
    },
    {
        "_id": "police",
        "name": "Police & Safety",
        "sla_hours": 2,
        "contact_email": "police@municipal.gov"
    },
    {
        "_id": "housing",
        "name": "Housing & Building",
        "sla_hours": 120,
        "contact_email": "housing@municipal.gov"
    },
    {
        "_id": "general",
        "name": "General Services",
        "sla_hours": 96,
        "contact_email": "general@municipal.gov"
    },
    {
        "_id": "miscellaneous",
        "name": "Miscellaneous",
        "sla_hours": 168,
        "contact_email": "misc@municipal.gov"
    }
]


async def seed_departments():
    """Upsert department documents with stable _id values."""
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB]
    departments_col = db["departments"]
    
    for dept in DEPARTMENTS:
        await departments_col.update_one(
            {"_id": dept["_id"]},
            {"$set": dept},
            upsert=True
        )
    
    print(f"✓ Seeded {len(DEPARTMENTS)} departments")
    return db


async def create_superadmin(db, email: str, password: str):
    """Create a superadmin user."""
    users_col = db["users"]
    
    existing = await users_col.find_one({"email": email})
    if existing:
        print(f"✗ User with email {email} already exists")
        return
    
    hashed_password = pwd_context.hash(password)
    user_doc = {
        "email": email,
        "hashed_password": hashed_password,
        "role": "superadmin",
        "departments": []  # superadmin sees all
    }
    
    await users_col.insert_one(user_doc)
    print(f"✓ Created superadmin: {email}")


async def main():
    """Main seed function."""
    db = await seed_departments()
    
    # Check for --create-superadmin flag
    if "--create-superadmin" in sys.argv:
        email = None
        password = None
        
        for arg in sys.argv:
            if arg.startswith("email="):
                email = arg.split("=", 1)[1]
            elif arg.startswith("password="):
                password = arg.split("=", 1)[1]
        
        if email and password:
            await create_superadmin(db, email, password)
        else:
            print("✗ --create-superadmin requires email=... and password=...")
    
    print("✓ Seed complete")


if __name__ == "__main__":
    asyncio.run(main())
