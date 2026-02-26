"""
Script to test the admin API endpoint directly.
"""
import requests
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.security import create_access_token

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "grievance_db"
API_URL = "http://localhost:8000"


async def test_admin_api():
    """Test the admin API endpoint."""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users_col = db.users
    
    try:
        # Get test user
        user = await users_col.find_one({"email": "test@example.com"})
        if not user:
            print("❌ Test user not found!")
            return
        
        print(f"✅ Found user: {user['email']}")
        print(f"   Role: {user.get('role')}")
        print(f"   Departments: {user.get('departments', [])}")
        
        # Create a token
        token_data = {
            "sub": str(user["_id"]),
            "role": "admin",
            "department_ids": ["water"]
        }
        token = create_access_token(data=token_data)
        print(f"\n✅ Created token for admin role with water department")
        
        # Test the API
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_URL}/api/admin/grievances",
            params={"skip": 0, "limit": 1000},
            headers=headers
        )
        
        print(f"\n📡 API Response:")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success! Fetched {len(data)} grievances")
            if data:
                print(f"\n   First grievance:")
                print(f"   - Message: {data[0]['message'][:50]}...")
                print(f"   - Department: {data[0]['predicted_department']}")
                print(f"   - Status: {data[0]['status']}")
        else:
            print(f"   ❌ Error: {response.text}")
            
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(test_admin_api())
