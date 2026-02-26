"""
Script to create a universal test account that can login with any role.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "grievance_db"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Universal test account
TEST_ACCOUNT = {
    "email": "test@example.com",
    "password": "Test123!",
    "role": "superadmin",  # Superadmin can access all roles
    "departments": ["water", "sanitation", "roads", "electricity", "health", "police", "housing", "general", "miscellaneous"]
}


async def create_test_account():
    """Create universal test account."""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users_col = db.users
    
    try:
        email = TEST_ACCOUNT["email"]
        
        # Check if account exists
        existing = await users_col.find_one({"email": email})
        
        hashed_password = pwd_context.hash(TEST_ACCOUNT["password"])
        
        if existing:
            # Update existing account
            await users_col.update_one(
                {"email": email},
                {
                    "$set": {
                        "hashed_password": hashed_password,
                        "role": TEST_ACCOUNT["role"],
                        "departments": TEST_ACCOUNT["departments"]
                    }
                }
            )
            print(f"✅ Updated test account: {email}")
        else:
            # Create new account
            user_doc = {
                "email": email,
                "hashed_password": hashed_password,
                "role": TEST_ACCOUNT["role"],
                "departments": TEST_ACCOUNT["departments"]
            }
            result = await users_col.insert_one(user_doc)
            print(f"✅ Created test account: {email}")
        
        print(f"\n🔐 Universal Test Account Created!")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"Email:    {TEST_ACCOUNT['email']}")
        print(f"Password: {TEST_ACCOUNT['password']}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"\n✨ This account can login with ANY role:")
        print(f"   • Citizen")
        print(f"   • Admin (any department)")
        print(f"   • Super Admin")
        print(f"\nJust select the role and department at login!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(create_test_account())
