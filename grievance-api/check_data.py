"""
Script to check database contents.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "grievance_db"


async def check_data():
    """Check database contents."""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    try:
        # Check users
        users_col = db.users
        users_count = await users_col.count_documents({})
        print(f"\n👥 Users: {users_count}")
        
        if users_count > 0:
            print("\nUser details:")
            async for user in users_col.find({}):
                print(f"  - {user.get('email')} | Role: {user.get('role')} | Departments: {user.get('departments', [])}")
        
        # Check grievances
        grievances_col = db.grievances
        grievances_count = await grievances_col.count_documents({})
        print(f"\n📝 Grievances: {grievances_count}")
        
        if grievances_count > 0:
            print("\nGrievance details:")
            async for grievance in grievances_col.find({}).limit(5):
                print(f"  - ID: {str(grievance.get('_id'))}")
                print(f"    Message: {grievance.get('message')[:50]}...")
                print(f"    Department: {grievance.get('predicted_department')}")
                print(f"    Status: {grievance.get('status')}")
                print(f"    Priority: {grievance.get('priority')}")
                print()
        
        # Check by department
        print("\n📊 Grievances by department:")
        pipeline = [
            {"$group": {"_id": "$predicted_department", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        async for doc in grievances_col.aggregate(pipeline):
            print(f"  - {doc['_id']}: {doc['count']}")
        
        # Check by status
        print("\n📊 Grievances by status:")
        pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        async for doc in grievances_col.aggregate(pipeline):
            print(f"  - {doc['_id']}: {doc['count']}")
            
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(check_data())
