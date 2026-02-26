"""
Script to create or update superadmin user.
Run this to ensure superadmin exists with correct credentials.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "grievance_db"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Superadmin credentials
SUPERADMIN_EMAIL = "admin@example.com"
SUPERADMIN_PASSWORD = "Admin123!"


async def create_superadmin():
    """Create or update the superadmin user."""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users_col = db.users
    
    try:
        # Check if superadmin exists
        existing = await users_col.find_one({"email": SUPERADMIN_EMAIL})
        
        hashed_password = pwd_context.hash(SUPERADMIN_PASSWORD)
        
        if existing:
            # Update existing superadmin
            await users_col.update_one(
                {"email": SUPERADMIN_EMAIL},
                {
                    "$set": {
                        "hashed_password": hashed_password,
                        "role": "superadmin",
                        "departments": []
                    }
                }
            )
            print(f"✅ Updated superadmin user: {SUPERADMIN_EMAIL}")
        else:
            # Create new superadmin
            user_doc = {
                "email": SUPERADMIN_EMAIL,
                "hashed_password": hashed_password,
                "role": "superadmin",
                "departments": []
            }
            result = await users_col.insert_one(user_doc)
            print(f"✅ Created superadmin user: {SUPERADMIN_EMAIL}")
            print(f"   User ID: {result.inserted_id}")
        
        print(f"   Password: {SUPERADMIN_PASSWORD}")
        print("\n🔐 You can now login with these credentials")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(create_superadmin())
