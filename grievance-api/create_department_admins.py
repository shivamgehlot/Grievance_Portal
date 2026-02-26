"""
Script to create department-specific admin users.
Run this to create admins for different departments.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "grievance_db"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Department admin configurations
DEPARTMENT_ADMINS = [
    {
        "email": "water.admin@example.com",
        "password": "Water123!",
        "role": "admin",
        "departments": ["water"]
    },
    {
        "email": "roads.admin@example.com",
        "password": "Roads123!",
        "role": "admin",
        "departments": ["roads"]
    },
    {
        "email": "electricity.admin@example.com",
        "password": "Electricity123!",
        "role": "admin",
        "departments": ["electricity"]
    },
    {
        "email": "health.admin@example.com",
        "password": "Health123!",
        "role": "admin",
        "departments": ["health"]
    },
    {
        "email": "sanitation.admin@example.com",
        "password": "Sanitation123!",
        "role": "admin",
        "departments": ["sanitation"]
    },
    {
        "email": "multi.admin@example.com",
        "password": "Multi123!",
        "role": "admin",
        "departments": ["water", "roads", "electricity"]  # Admin for multiple departments
    }
]


async def create_department_admins():
    """Create department-specific admin users."""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users_col = db.users
    
    try:
        print("Creating department admin users...\n")
        
        for admin_data in DEPARTMENT_ADMINS:
            email = admin_data["email"]
            
            # Check if admin already exists
            existing = await users_col.find_one({"email": email})
            
            hashed_password = pwd_context.hash(admin_data["password"])
            
            if existing:
                # Update existing admin
                await users_col.update_one(
                    {"email": email},
                    {
                        "$set": {
                            "hashed_password": hashed_password,
                            "role": admin_data["role"],
                            "departments": admin_data["departments"]
                        }
                    }
                )
                print(f"✅ Updated admin: {email}")
            else:
                # Create new admin
                user_doc = {
                    "email": email,
                    "hashed_password": hashed_password,
                    "role": admin_data["role"],
                    "departments": admin_data["departments"]
                }
                result = await users_col.insert_one(user_doc)
                print(f"✅ Created admin: {email}")
            
            print(f"   Departments: {', '.join(admin_data['departments'])}")
            print(f"   Password: {admin_data['password']}\n")
        
        print("\n🔐 All department admins created successfully!")
        print("\nLogin credentials:")
        print("-" * 60)
        for admin_data in DEPARTMENT_ADMINS:
            print(f"{admin_data['email']:30} | {admin_data['password']}")
            print(f"  Departments: {', '.join(admin_data['departments'])}")
            print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(create_department_admins())
