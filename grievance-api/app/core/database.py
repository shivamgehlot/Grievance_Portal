from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# MongoDB client
client: AsyncIOMotorClient = None


async def connect_to_mongo():
    """Connect to MongoDB on startup."""
    global client
    client = AsyncIOMotorClient(settings.MONGO_URI)


async def close_mongo_connection():
    """Close MongoDB connection on shutdown."""
    global client
    if client:
        client.close()


def get_database():
    """Get the MongoDB database instance."""
    return client[settings.MONGO_DB]


# Convenience accessors for collections
@property
def db():
    """Get database instance."""
    return get_database()


def get_users_collection():
    """Get users collection."""
    return get_database()["users"]


def get_departments_collection():
    """Get departments collection."""
    return get_database()["departments"]


def get_grievances_collection():
    """Get grievances collection."""
    return get_database()["grievances"]


# Export shortcuts
users = get_users_collection
departments = get_departments_collection
grievances = get_grievances_collection
